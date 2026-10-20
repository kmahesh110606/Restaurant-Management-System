# Deploy RMS to AWS EC2 with GitHub Actions

This guide deploys the React/Nginx frontend, Django/Gunicorn backend, PostgreSQL and Caddy as separate containers on one EC2 instance. Caddy provides HTTPS. Only ports 80 and 443 are public; database and backend traffic stays on the Docker network.

Every push to `main` runs CI, builds two images in Amazon ECR and uses AWS Systems Manager (SSM) to deploy them. GitHub authenticates through OIDC; there are no permanent AWS access keys or SSH keys in GitHub. Application secrets remain in `/opt/rms/.env` on EC2.

This is a single-server starting point with short deployment interruptions, not a highly available service. EC2, EBS, public IPv4, ECR and backup storage can incur charges; configure an AWS Budget and check your account's pricing/free-tier eligibility. A domain you control is required for this HTTPS configuration.

## 1. Choose a region and create container repositories

Use one region throughout, for example Mumbai `ap-south-1`. Record your 12-digit AWS account ID.

In **Amazon ECR → Private registry → Repositories → Create repository**, create:

- `rms-backend`
- `rms-frontend`

Use mutable tags so rerunning the same commit can push again. Releases are referenced by full commit SHA, never `latest`. Enable image scanning. Retain previous release tags for rollback; avoid lifecycle policies that delete images still deployed.

## 2. Create the EC2 instance role

In **IAM → Roles → Create role**, choose **AWS service → EC2**. Attach:

- `AmazonSSMManagedInstanceCore`
- `AmazonEC2ContainerRegistryReadOnly`

Name it `rms-ec2-role`. This role lets the instance receive deployment commands and pull images. The GitHub role created later is separate.

## 3. Launch EC2

1. Open **EC2 → Instances → Launch instances**, in the chosen region.
2. Name it `rms-production`.
3. Select **Ubuntu Server 24.04 LTS**, **64-bit x86**. Do not choose ARM/Graviton: the workflow builds `linux/amd64`.
4. Start with `t3.medium` (2 vCPU, 4 GiB RAM); measure actual usage before resizing. Builds run on GitHub, not EC2.
5. You may proceed without a key pair if you will use Session Manager.
6. Choose a public subnet with an Internet Gateway route and enable a public IP.
7. Create a security group allowing inbound TCP **80** and **443** from `0.0.0.0/0`. Add IPv6 rules only if you configure IPv6. Do not expose 5432, 8000 or 3000. SSM requires no inbound SSH rule. Keep outbound access for SSM, ECR, package downloads and certificate issuance.
8. Configure at least **30 GiB gp3 encrypted EBS**. Consider disabling “Delete on termination” for data preservation; retained disks still incur charges.
9. Under **Advanced details → IAM instance profile**, choose `rms-ec2-role`. Require IMDSv2.
10. Launch and record the instance ID (`i-...`).

Under **EC2 → Elastic IP addresses**, allocate an Elastic IP and associate it with this instance. Set a DNS `A` record such as `rms.example.com` to that IP at your DNS provider. Remove stale `AAAA` records unless IPv6 is correctly configured. Wait for DNS to resolve before deployment.

## 4. Install Docker and prepare server secrets

Select the instance → **Connect → Session Manager → Connect**. If it is unavailable, check the attached role, outbound HTTPS and SSM Agent. Ubuntu AWS images commonly include the agent; check `sudo snap services amazon-ssm-agent`, or follow AWS's SSM Agent installation instructions.

Run `sudo -i`. Copy the contents of [`deploy/bootstrap.sh`](../deploy/bootstrap.sh) into `/tmp/rms-bootstrap.sh`, then run:

```bash
bash /tmp/rms-bootstrap.sh
cd /opt/rms
umask 077
nano .env
```

Copy [`deploy/.env.example`](../deploy/.env.example) into that file and replace:

```dotenv
DOMAIN=rms.example.com
ACME_EMAIL=your-real-email@example.com
DB_NAME=rms_db
DB_USER=rms_user
DB_PASSWORD=your_generated_password
DJANGO_SECRET_KEY=your_generated_secret
GOOGLE_CLIENT_ID=
```

Generate two separate random values with `openssl rand -hex 32`. Use one for the database password and one for Django. Keep these values private, and run `chmod 600 /opt/rms/.env`. Do not commit this file or paste it into Actions logs. Changing `DB_PASSWORD` later does not change an existing PostgreSQL user's password; rotate it inside PostgreSQL and update the file together.

Google sign-in is optional. If enabled, use the same Google client ID here and in the GitHub variable below; register `https://rms.example.com` as an authorized JavaScript origin with Google.

## 5. Allow GitHub to authenticate with AWS

1. In **IAM → Identity providers → Add provider**, choose OpenID Connect:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
2. Create an IAM role named `rms-github-deploy`.
3. Use [`deploy/github-trust.json`](../deploy/github-trust.json) as its custom trust policy. Replace `ACCOUNT_ID`. The template uses this repository's current owner/name; adjust it if you fork or rename the repository.
4. Add an inline permission policy using [`deploy/github-policy.json`](../deploy/github-policy.json). Replace every `ACCOUNT_ID`, `REGION` and `INSTANCE_ID`.
5. Record the role ARN: `arn:aws:iam::ACCOUNT_ID:role/rms-github-deploy`.

The trust policy is scoped to the GitHub `production` environment. The permission policy grants image pushes to just the two repositories and shell commands on just your instance. Deployment commands run as root, so protect repository and environment access.

## 6. Configure GitHub

In the repository's **Settings → Environments**, create **production**. Restrict deployment branches to **main**. Add these environment **variables** (not secrets):

| Variable | Value |
|---|---|
| `AWS_REGION` | e.g. `ap-south-1` |
| `EC2_INSTANCE_ID` | the `i-...` instance ID |
| `AWS_DEPLOY_ROLE_ARN` | the role ARN from step 5 |
| `GOOGLE_CLIENT_ID` | optional public OAuth client ID |

For fully automatic deployment, leave required reviewers disabled. Enable them if you want a release approval step. Protect `main` with pull requests and the frontend/backend CI checks where your GitHub plan supports this.

No application passwords, `.pem` file, AWS access key or AWS secret key are needed in GitHub.

## 7. Commit and deploy

Commit the new deployment files and updated CI/README to your repository and push to `main` after completing AWS setup:

```bash
git add .github/workflows/ci.yml .github/workflows/deploy.yml deploy docs/AWS-DEPLOYMENT.md README.md
git add client/src client/vite.config.js
git commit -m "Add EC2 container deployment pipeline and resolve frontend build blockers"
git push origin main
```

Open **Actions → Deploy to EC2**. You can also use **Run workflow**, choosing `main`.

The workflow runs lint, frontend tests/build, Django tests against disposable PostgreSQL and migration consistency checks. It builds/pushes both images, transfers deployment configuration through SSM, pulls images on EC2, backs up an existing running database, starts containers and applies Django migrations/static collection through the existing entrypoint. Finally, it checks the public HTTPS page and Django admin login page. Failure stops the workflow; it does not automatically reverse database migrations.

Initial certificate issuance can take a few minutes. Open `https://rms.example.com` after the workflow succeeds. On EC2, inspect:

```bash
cd /opt/rms
docker compose --env-file .env --env-file release.env -f compose.yml ps
docker compose --env-file .env --env-file release.env -f compose.yml logs --tail 100
docker compose --env-file .env --env-file release.env -f compose.yml exec backend python manage.py createsuperuser
```

`release.env` is written only after a successful deployment. If first deployment fails, set `export REGISTRY=ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com IMAGE_TAG=FULL_COMMIT_SHA` and omit `--env-file release.env` when diagnosing.

Use `/django-admin/` for Django administration. Confirm restaurant signup/login, menu uploads, customer ordering and staff billing with a dedicated test restaurant before using real data.

## 8. Updates, persistence and recovery

Merge subsequent changes into `main` to deploy. Named volumes under the fixed Compose project name `rms` preserve PostgreSQL, uploads, static files and TLS state across container replacement. Never use `docker compose down -v` or `docker volume prune` on this server. These are new volumes: this procedure does not migrate any existing local RMS records automatically.

Pre-deploy database dumps are stored with private permissions in `/opt/rms/backups`. They protect against migration problems but are on the same disk as the database. Before real use, configure scheduled off-instance backups (for example encrypted S3 storage) for both database dumps and uploaded media, retention, and a restore test. EBS snapshots/AWS Backup can supplement this; coordinate snapshots for application consistency. Monitor disk usage, certificate renewal, container health and deployment failures.

Create an additional database dump and media backup:

```bash
sudo -i
cd /opt/rms
umask 077
mkdir -p backups
docker compose --env-file .env --env-file release.env -f compose.yml exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/manual.sql
docker run --rm -v rms_backend_media:/data:ro -v /opt/rms/backups:/backup \
  alpine:3 tar czf /backup/media.tar.gz -C /data .
```

For a consistent database/media pair, pause application writes during the backup. Validate the dump in a separate PostgreSQL database and extract media into a separate volume; never test restores over live data.

For an application-only rollback, first confirm the older application is compatible with the current database schema. On EC2 run:

```bash
sudo bash /opt/rms/release.sh ap-south-1 \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com PREVIOUS_FULL_40_CHARACTER_COMMIT_SHA
```

This uses the currently installed Compose configuration; if that changed incompatibly, restore the matching deployment files from the previous commit first. Database rollback requires an explicitly planned restore, potentially losing writes since the backup; it is not automatic. Keep ECR images and backups for your intended rollback window.

## Troubleshooting

| Symptom | Check |
|---|---|
| OIDC access denied | Exact repository/environment in trust policy; production branch restriction; role ARN |
| SSM target not connected | Instance region/ID, role, running agent, outbound HTTPS |
| ECR access denied | Both repository names, GitHub push policy, EC2 pull policy |
| HTTPS fails | DNS A/AAAA, Elastic IP, security group 80/443, Caddy logs |
| Backend unhealthy | Django migrations/settings, database credentials, backend logs |
| 502 after deployment | Backend health, frontend logs; recreate frontend after backend changes |
| Disk fills | Docker images, logs and local backups; remove only reviewed unused images/backups |

## References

- [AWS EC2 launch parameters](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-launch-parameters.html)
- [AWS Systems Manager instance permissions](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-permissions.html)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https)
