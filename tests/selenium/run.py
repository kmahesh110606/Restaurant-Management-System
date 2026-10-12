"""Build and test the UI against a disposable backend. Run from any directory."""
import argparse
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.request import urlopen
from urllib.error import URLError

ROOT = Path(__file__).resolve().parents[2]


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def wait_ready(url, process):
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f'Test server exited; see test-results/selenium logs ({url}).')
        try:
            with urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return
        except (URLError, TimeoutError):
            time.sleep(.2)
    raise RuntimeError(f'Test server did not become ready: {url}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--headed', action='store_true', help='Show Chrome while running the tests')
    args = parser.parse_args()
    node = shutil.which('node')
    vite = ROOT / 'client/node_modules/vite/bin/vite.js'
    if not node or not vite.exists():
        parser.error('Install Node.js and run npm ci in client first.')
    output = ROOT / 'test-results/selenium'
    output.mkdir(parents=True, exist_ok=True)
    api_port, ui_port = free_port(), free_port()
    while api_port == ui_port:
        ui_port = free_port()
    environment = os.environ.copy()
    environment.update({
        'DJANGO_SETTINGS_MODULE': 'server.test_settings',
        'DJANGO_DEBUG': 'True',
        'VITE_API_URL': '',
        'VITE_GOOGLE_CLIENT_ID': '',
        'RMS_TEST_API_TARGET': f'http://127.0.0.1:{api_port}',
        'RMS_TEST_API_PORT': str(api_port),
        'RMS_SELENIUM_URL': f'http://127.0.0.1:{ui_port}',
        'RMS_SELENIUM_OUTPUT': str(output),
        'RMS_SELENIUM_HEADED': '1' if args.headed else '0',
    })
    # The suite cannot target an existing app or production host.
    with tempfile.TemporaryDirectory(prefix='rms-selenium-') as fixture:
        environment['RMS_TEST_FIXTURE_DIR'] = fixture
        subprocess.run([node, str(vite), 'build'], cwd=ROOT / 'client', env=environment, check=True)
        processes = []
        with (output / 'backend.log').open('w', encoding='utf-8') as backend_log, (output / 'frontend.log').open('w', encoding='utf-8') as frontend_log:
            try:
                backend = subprocess.Popen([sys.executable, str(Path(__file__).with_name('fixture_server.py'))], env=environment, stdout=backend_log, stderr=subprocess.STDOUT)
                processes.append(backend)
                wait_ready(f'http://127.0.0.1:{api_port}/api/v1/restaurants/test-resto/public/', backend)
                frontend = subprocess.Popen([node, str(vite), 'preview', '--host', '127.0.0.1', '--port', str(ui_port), '--strictPort'], cwd=ROOT / 'client', env=environment, stdout=frontend_log, stderr=subprocess.STDOUT)
                processes.append(frontend)
                wait_ready(environment['RMS_SELENIUM_URL'], frontend)
                os.environ.update({key: value for key, value in environment.items() if key.startswith('RMS_SELENIUM_')})
                suite = unittest.defaultTestLoader.discover(str(Path(__file__).parent), pattern='test_*.py')
                result = unittest.TextTestRunner(verbosity=2).run(suite)
                report = {'tests_run': result.testsRun, 'failures': [(str(test), detail) for test, detail in result.failures], 'errors': [(str(test), detail) for test, detail in result.errors], 'skipped': [(str(test), reason) for test, reason in result.skipped], 'successful': result.wasSuccessful()}
                (output / 'results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
                return 0 if result.wasSuccessful() else 1
            finally:
                for process in reversed(processes):
                    process.terminate()
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=10)


if __name__ == '__main__':
    sys.exit(main())
