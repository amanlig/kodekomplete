"""Serve the private dashboard and refresh Yahoo USD/CAD every 60 seconds."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import subprocess
import sys
import threading

from macro_data import usd_cad
from roll_candidates import INPUTS, SYMBOLS, output_path

ROOT = Path(__file__).resolve().parent
ROLL_REFRESH_LOCK = threading.Lock()


class MacroFeed:
    def __init__(self, path, interval=60):
        self.path, self.interval = path, interval
        self.lock = threading.Lock()
        self.stop = threading.Event()
        self.quote = None
        self.error = None
        self.attempted_at = None
        try:
            self.quote = json.loads(path.read_text())
        except (OSError, ValueError):
            pass

    def refresh(self):
        attempted = datetime.now(timezone.utc).isoformat()
        try:
            quote = usd_cad()
            temporary = self.path.with_suffix('.tmp')
            temporary.write_text(json.dumps(quote, indent=2))
            temporary.replace(self.path)
            with self.lock:
                self.quote, self.error, self.attempted_at = quote, None, attempted
        except (OSError, ValueError, KeyError, TypeError, IndexError, OverflowError):
            with self.lock:
                self.error = 'Yahoo refresh failed; showing the last successful capture.'
                self.attempted_at = attempted

    def snapshot(self):
        with self.lock:
            return dict(quote=self.quote, error=self.error, attempted_at=self.attempted_at,
                        refresh_seconds=self.interval)

    def run(self):
        while not self.stop.is_set():
            self.refresh()
            self.stop.wait(self.interval)


class DashboardHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/api/roll-candidates/refresh':
            self.send_error(404)
            return
        port = self.server.server_port
        if self.headers.get('Origin') not in {f'http://localhost:{port}', f'http://127.0.0.1:{port}'}:
            self.send_error(403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 <= length <= 2048:
                raise ValueError()
            request = json.loads(self.rfile.read(length)) if length else {}
            if not isinstance(request, dict):
                raise ValueError()
            account, symbol = request.get('account', 'LIRA'), request.get('symbol', 'QBTS')
            purchase = request.get('purchasePriceUsd')
            if account not in INPUTS or symbol not in SYMBOLS:
                raise ValueError()
            if purchase is not None and (isinstance(purchase, bool) or not isinstance(purchase, (int, float)) or not 0 < purchase < float('inf')):
                raise ValueError()
        except (ValueError, TypeError):
            self.send_error(400, 'Choose a supported account, stock and positive USD purchase price')
            return
        if not ROLL_REFRESH_LOCK.acquire(blocking=False):
            self.send_error(409, 'Candidate refresh already in progress')
            return
        try:
            command = [sys.executable, str(ROOT/'roll_candidates.py'), '--account', account, '--symbol', symbol]
            if purchase is not None:
                command += ['--purchase-price-usd', str(purchase)]
            subprocess.run(command,
                           cwd=ROOT, check=True, timeout=90, capture_output=True)
            payload = output_path(account, symbol).read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (OSError, subprocess.SubprocessError):
            self.send_error(502, 'Questrade candidate refresh failed; previous capture retained')
        finally:
            ROLL_REFRESH_LOCK.release()

    def do_GET(self):
        if self.path.split('?', 1)[0] == '/api/macro':
            payload = json.dumps(self.server.feed.snapshot()).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    feed = MacroFeed(ROOT/'reports/macro-data.json')
    server = ThreadingHTTPServer(('127.0.0.1', args.port),
                                 partial(DashboardHandler, directory=str(ROOT/'reports')))
    server.feed = feed
    worker = threading.Thread(target=feed.run, daemon=True)
    worker.start()
    print(f'Dashboard: http://localhost:{args.port}/equity-chart.html · Yahoo refresh every 60 seconds', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        feed.stop.set()
        server.server_close()


if __name__ == '__main__':
    main()
