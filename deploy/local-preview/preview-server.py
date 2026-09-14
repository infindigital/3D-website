#!/usr/bin/env python3
"""
RS Chef'z - local preview server (Python version).

Identical in behaviour to preview-server.mjs; use whichever of Python or
Node you already have. Serves the folder it sits in the way Hostinger
will, so the preview matches the live site.

It does the four things opening the file directly cannot:

  1. Acts as a real web server, so "/_next/..." resolves to this folder
     rather than the top of your hard disk.
  2. Implements the .htaccess clean-URL rule, so
     /products/gobi-manchurian-masala works without the .html.
  3. Answers byte-range requests, which <video> requires.
  4. Listens on the network and prints the address to open on a phone or
     tablet over the same Wi-Fi.

Run:  python preview-server.py
"""

import http.server
import os
import posixpath
import re
import socket
import sys
import threading
import urllib.parse
import webbrowser

HERE = os.path.dirname(os.path.abspath(__file__))

# The download keeps the site in its own folder, so that folder is exactly
# what gets uploaded and nothing else has to be deleted first. Serve it if it
# is there; otherwise serve whatever folder this file is sitting in, which is
# what happens once the launcher has been copied in beside index.html.
SITE_FOLDER = "UPLOAD-TO-public_html"
ROOT = (
    os.path.join(HERE, SITE_FOLDER)
    if os.path.isfile(os.path.join(HERE, SITE_FOLDER, "index.html"))
    else HERE
)

PORT = int(os.environ.get("PORT", "8080"))

TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
}

RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass  # quiet

    def resolve(self, path):
        """Map a URL path to a file, applying the clean-URL rule."""
        path = urllib.parse.unquote(path.split("?", 1)[0].split("#", 1)[0])
        path = posixpath.normpath(path)
        parts = [p for p in path.split("/") if p and p not in (".", "..")]
        target = os.path.join(ROOT, *parts)

        if path == "/" or not parts:
            return os.path.join(ROOT, "index.html")
        if os.path.isfile(target):
            return target
        if os.path.isfile(os.path.join(target, "index.html")):
            return os.path.join(target, "index.html")
        if not os.path.splitext(target)[1] and os.path.isfile(target + ".html"):
            return target + ".html"
        return None

    def do_HEAD(self):
        self.respond(head_only=True)

    def do_GET(self):
        self.respond()

    def respond(self, head_only=False):
        raw = self.path.split("?", 1)[0]
        if len(raw) > 1 and raw.endswith("/"):
            self.send_response(301)
            self.send_header("Location", raw[:-1])
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        target = self.resolve(self.path)

        if target is None:
            nf = os.path.join(ROOT, "404.html")
            body = open(nf, "rb").read() if os.path.isfile(nf) else b"404 Not Found"
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if not head_only:
                self.wfile.write(body)
            return

        with open(target, "rb") as fh:
            body = fh.read()
        ctype = TYPES.get(os.path.splitext(target)[1].lower(), "application/octet-stream")

        rng = self.headers.get("Range")
        if rng:
            m = RANGE_RE.match(rng.strip())
            if m:
                size = len(body)
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else size - 1
                if start <= end < size:
                    chunk = body[start : end + 1]
                    self.send_response(206)
                    self.send_header("Content-Type", ctype)
                    self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Content-Length", str(len(chunk)))
                    self.send_header("Cache-Control", "no-store")
                    self.end_headers()
                    if not head_only:
                        self.wfile.write(chunk)
                    return

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if not head_only:
            self.wfile.write(body)


def lan_addresses():
    found = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # no packet sent; just picks the route
        found.append(s.getsockname()[0])
        s.close()
    except Exception:
        pass
    return found


if __name__ == "__main__":
    try:
        server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    except OSError as err:
        print(f"\n  Could not start on port {PORT}: {err}")
        print("  Close the other preview window, or pick another port:")
        print("      PORT=8081 python preview-server.py\n")
        sys.exit(1)

    print("\n  RS Chef'z preview is running.\n")
    print(f"  On this computer:   http://localhost:{PORT}")
    lan = lan_addresses()
    if lan:
        print("\n  On your phone or tablet (same Wi-Fi):")
        for ip in lan:
            print(f"                      http://{ip}:{PORT}")
    print("\n  Leave this window open. Press Ctrl+C to stop.\n")

    # Open the browser, so the whole thing is one double-click and nobody
    # has to type an address anywhere.
    if os.environ.get("NO_OPEN") != "1":
        threading.Timer(
            0.4, lambda: webbrowser.open(f"http://localhost:{PORT}")
        ).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Preview stopped.\n")
