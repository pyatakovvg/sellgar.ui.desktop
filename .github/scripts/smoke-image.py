import json
import subprocess
import sys
import tempfile
import time
import uuid
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import urlopen


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = set()

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        source = attributes.get("src") if tag == "script" else attributes.get("href")
        if tag in {"script", "link"} and source and source.startswith("/_next/static/"):
            self.assets.add(source)


def docker(*arguments):
    result = subprocess.run(
        ["docker", *arguments], check=True, capture_output=True, text=True, timeout=90
    )
    return result.stdout.strip()


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def request(base_url, path):
    try:
        response = urlopen(base_url + path, timeout=10)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def check_http(base_url, public_url):
    deadline = time.monotonic() + 45
    while True:
        try:
            status, _, body = request(base_url, "/healthz")
            if status == 200:
                require(json.loads(body) == {"status": "ok"}, "Unexpected health response")
                break
        except (URLError, TimeoutError, ConnectionError):
            pass
        require(time.monotonic() < deadline, "Next server did not become ready within 45 seconds")
        time.sleep(0.25)

    status, headers, body = request(base_url, "/")
    require(status == 200 and b"<html" in body, "SSR catalog failed")
    require(public_url.encode() in body, "SSR did not serialize runtime public configuration")
    require(b"http://gateway:8080" not in body, "Private gateway address leaked into HTML")
    require(b"private-smoke-sentinel" not in body, "Private environment value leaked into HTML")
    require("no-store" in headers.get("Cache-Control", ""), "Personal SSR must not be cached")
    require(
        any("smoke-session=fixture" in cookie for cookie in headers.get_all("Set-Cookie", [])),
        "Session cookie was not forwarded",
    )

    parser = AssetParser()
    parser.feed(body.decode())
    require(bool(parser.assets), "Next static assets are missing from HTML")
    for path in sorted(parser.assets):
        status, headers, body = request(base_url, path)
        require(status == 200 and body, f"Missing asset: {path}")
        require("immutable" in headers.get("Cache-Control", ""), f"Asset is not immutable: {path}")
    status, _, _ = request(base_url, "/_next/static/smoke-missing.js")
    require(status == 404, "Missing static asset must return 404")


def main(image):
    network = f"storefront-smoke-{uuid.uuid4().hex[:12]}"
    containers = []
    docker("network", "create", network)
    try:
        fixture = Path(__file__).with_name("smoke-gateway.mjs").resolve()
        gateway = docker(
            "run", "--detach", "--network", network, "--network-alias", "gateway",
            "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true",
            "--mount", f"type=bind,source={fixture},target=/fixture.mjs,readonly",
            "--entrypoint", "node", image, "/fixture.mjs",
        )
        containers.append(gateway)
        for environment in ["a", "b"]:
            public_url = f"https://public-{environment}.smoke.invalid"
            with tempfile.TemporaryDirectory(prefix="storefront-env-") as directory:
                Path(directory).chmod(0o755)
                config = Path(directory) / ".env"
                config.write_text(
                    f"CLIENT_GATEWAY_URL=http://gateway:8080\n"
                    f"PUBLIC_CLIENT_GATEWAY_URL={public_url}\n"
                    f"PUBLIC_SOCKET_GATEWAY_URL=https://socket-{environment}.smoke.invalid\n"
                    "PRIVATE_VALUE=private-smoke-sentinel\n"
                )
                config.chmod(0o644)
                container = docker(
                    "run", "--detach", "--network", network,
                    "--read-only", "--tmpfs", "/tmp:rw,nosuid,noexec,size=64m",
                    "--tmpfs", "/app/clients/desktop/.next/cache:rw,nosuid,noexec,size=64m,uid=1000,gid=1000",
                    "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true",
                    "--publish", "127.0.0.1::8080",
                    "--mount", f"type=bind,source={config},target=/app/clients/desktop/.env,readonly",
                    image,
                )
                containers.append(container)
                try:
                    require(docker("exec", container, "id", "-u") == "1000", "Next must run as node")
                    ports = json.loads(docker("inspect", "--format", "{{json .NetworkSettings.Ports}}", container))
                    port = ports["8080/tcp"][0]["HostPort"]
                    check_http(f"http://127.0.0.1:{port}", public_url)
                except BaseException:
                    subprocess.run(["docker", "logs", container], check=False, timeout=10)
                    raise
                finally:
                    docker("rm", "--force", container)
                    containers.remove(container)
        print("Passed: same image with two mounted .env files, SSR/session/cart preload, private config isolation, assets, non-root read-only runtime")
    finally:
        for container in containers:
            docker("rm", "--force", container)
        docker("network", "rm", network)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 .github/scripts/smoke-image.py IMAGE")
    main(sys.argv[1])
