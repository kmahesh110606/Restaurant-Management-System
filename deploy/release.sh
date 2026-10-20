#!/usr/bin/env bash
set -Eeuo pipefail
cd /opt/rms
exec 9>/opt/rms/deploy.lock
flock -n 9 || { echo "Another deployment is active"; exit 1; }
export AWS_DEFAULT_REGION="$1" REGISTRY="$2" IMAGE_TAG="$3"
[[ "$IMAGE_TAG" =~ ^[a-f0-9]{40}$ ]] || exit 1
test -s .env
umask 077
aws ecr get-login-password | docker login --username AWS --password-stdin "$REGISTRY"
dc() { docker compose --env-file .env -f compose.yml "$@"; }
dc config --quiet
dc pull
mkdir -p backups
# Preserve a pre-migration database dump whenever the database already exists.
if [ -n "$(dc ps --status running -q db)" ]; then
    backup="backups/$(date -u +%Y%m%dT%H%M%SZ)-${IMAGE_TAG}.sql"
    dc exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$backup.tmp"
    mv "$backup.tmp" "$backup"
fi
# Recreate Nginx after backend replacement so its upstream DNS is refreshed.
dc up -d --wait --wait-timeout 360 --force-recreate backend frontend proxy
domain=$(dc exec -T backend printenv DJANGO_ALLOWED_HOSTS)
curl --fail --silent --show-error --retry 12 --retry-delay 10 --retry-all-errors \
    --max-time 15 "https://${domain}/" >/dev/null
curl --fail --silent --show-error --retry 6 --retry-delay 5 --retry-all-errors \
    --max-time 15 "https://${domain}/django-admin/login/" >/dev/null
printf 'REGISTRY=%s\nIMAGE_TAG=%s\n' "$REGISTRY" "$IMAGE_TAG" > release.env
echo "Deployment healthy: $IMAGE_TAG"
