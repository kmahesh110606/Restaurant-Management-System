#!/usr/bin/env bash
# Run once as root on a fresh Ubuntu 24.04 x86_64 EC2 instance.
set -Eeuo pipefail
apt-get update
apt-get install -y ca-certificates curl unzip
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
# Rotate container logs before the first deployment.
install -d /etc/docker
if [ ! -e /etc/docker/daemon.json ]; then
    echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' > /etc/docker/daemon.json
fi
systemctl enable docker
systemctl restart docker
if ! command -v aws >/dev/null; then
    tmpdir=$(mktemp -d)
    curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o "$tmpdir/aws.zip"
    unzip -q "$tmpdir/aws.zip" -d "$tmpdir"
    "$tmpdir/aws/install"
fi
install -d -m 700 /opt/rms
docker compose version
aws --version
