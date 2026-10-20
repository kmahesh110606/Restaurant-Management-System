"""Send reviewed deployment files through SSM; application secrets stay on EC2."""
import base64
import json
import os
from pathlib import Path
import subprocess
import time


def aws(*args):
    return json.loads(subprocess.check_output(["aws", *args, "--output", "json"], text=True))


commands = ["set -eu", "install -d -m 700 /opt/rms"]
for name in ("compose.yml", "Caddyfile", "release.sh"):
    data = base64.b64encode(Path("deploy", name).read_bytes()).decode()
    commands.append(f"echo '{data}' | base64 -d > /opt/rms/{name}")
# Only trusted, fixed-format AWS identifiers and commit SHAs enter shell commands.
import re
region, registry, sha = (os.environ[k] for k in ("AWS_REGION", "REGISTRY", "GITHUB_SHA"))
assert re.fullmatch(r"[a-z]{2}-[a-z]+-\d", region)
assert re.fullmatch(r"\d{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com", registry)
assert re.fullmatch(r"[a-f0-9]{40}", sha)
commands.append(f"bash /opt/rms/release.sh '{region}' '{registry}' '{sha}'")
result = aws("ssm", "send-command", "--instance-ids", os.environ["INSTANCE_ID"],
             "--document-name", "AWS-RunShellScript", "--timeout-seconds", "600",
             "--parameters", json.dumps({"commands": commands, "executionTimeout": ["1200"]}))
command_id = result["Command"]["CommandId"]
print(f"SSM command: {command_id}", flush=True)
for _ in range(150):
    time.sleep(10)
    try:
        result = aws("ssm", "get-command-invocation", "--command-id", command_id,
                     "--instance-id", os.environ["INSTANCE_ID"])
    except subprocess.CalledProcessError:
        continue  # SSM invocation can take a moment to become visible.
    if result["Status"] in ("Pending", "InProgress", "Delayed"):
        continue
    print(result.get("StandardOutputContent", ""))
    print(result.get("StandardErrorContent", ""))
    raise SystemExit(0 if result["Status"] == "Success" else 1)
raise SystemExit("SSM timed out; inspect the command in AWS before retrying.")
