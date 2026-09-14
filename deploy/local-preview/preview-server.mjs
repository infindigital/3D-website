/**
 * RS Chef'z — local preview server (Node version).
 *
 * Serves the folder it is sitting in the way Hostinger will, so what you
 * see locally is what goes live. It does the four things a plain file
 * open cannot:
 *
 *   1. Acts as a real web server, so "/_next/..." resolves to this folder
 *      instead of the top of your hard disk. That alone is the difference
 *      between a blank serif page and the site.
 *   2. Implements the .htaccess clean-URL rule, so
 *      /products/gobi-manchurian-masala works without the .html.
 *   3. Answers byte-range requests, which <video> requires. Without them
 *      the browser refuses the film even though the file is perfect.
 *   4. Listens on every network interface and prints the address your
 *      phone and tablet can use over the same Wi-Fi.
 *
 * Run:  node preview-server.mjs
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces, platform } from "node:os";
import { spawn } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));

/*
 * The download keeps the site in its own folder, so that folder is exactly
 * what gets uploaded and nothing else has to be deleted first. Serve it if
 * it is there; otherwise serve whatever folder this file is sitting in,
 * which is what happens once the launcher has been copied in beside
 * index.html.
 */
const SITE_FOLDER = "UPLOAD-TO-public_html";
const ROOT = existsSync(join(HERE, SITE_FOLDER, "index.html"))
  ? join(HERE, SITE_FOLDER)
  : HERE;

const PORT = Number(process.env.PORT ?? 8080);

/*
 * The permanent redirects .htaccess serves, repeated here so the preview
 * tells the same truth as Hostinger. Without them an old address 404s
 * locally and silently works live, which is the wrong way round for a thing
 * whose job is to show you what you are about to upload.
 */
const REDIRECTS = new Map([
  ["/products/three-in-one-masala", "/products/chicken-65-masala"],
]);

const TYPES = {
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
};

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

function lanAddresses() {
  const out = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === "IPv4" && !net.internal) out.push(net.address);
    }
  }
  return out;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let path = decodeURIComponent(url.pathname);

    // Never let a request climb out of this folder.
    path = normalize(path).replace(/^(\.\.[/\\])+/, "");

    if (path.length > 1 && path.endsWith("/")) {
      res.writeHead(301, { Location: path.slice(0, -1) + url.search });
      return res.end();
    }

    const moved = REDIRECTS.get(path);
    if (moved) {
      res.writeHead(301, { Location: moved + url.search });
      return res.end();
    }

    let file = path === "/" ? join(ROOT, "index.html") : join(ROOT, path);

    if (!(await isFile(file))) {
      if (await isFile(join(file, "index.html"))) {
        file = join(file, "index.html");
      } else if (!extname(path) && (await isFile(`${file}.html`))) {
        // The .htaccess clean-URL rule.
        file = `${file}.html`;
      } else {
        const notFound = join(ROOT, "404.html");
        const body = (await isFile(notFound))
          ? await readFile(notFound)
          : "404 Not Found";
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(body);
      }
    }

    const body = await readFile(file);
    const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";

    // Byte ranges, for <video>.
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        const size = body.length;
        const start = m[1] ? Number(m[1]) : 0;
        const end = m[2] ? Number(m[2]) : size - 1;
        if (start <= end && end < size) {
          res.writeHead(206, {
            "Content-Type": type,
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Cache-Control": "no-store",
          });
          return res.end(body.subarray(start, end + 1));
        }
      }
    }

    res.writeHead(200, {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Content-Length": body.length,
      // Never cache locally, so a rebuild always shows.
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n  Port ${PORT} is already being used by something else.` +
        `\n  Close the other preview window, or start this one on a different` +
        `\n  port:   PORT=8081 node preview-server.mjs\n`,
    );
    process.exit(1);
  }
  throw err;
});

/**
 * Open the site in the default browser, so the whole thing is one
 * double-click and nobody has to type an address anywhere.
 */
function openBrowser(url) {
  const cmd =
    platform() === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : platform() === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  try {
    const child = spawn(cmd[0], cmd[1], { stdio: "ignore", detached: true });
    /*
     * A missing opener is reported asynchronously, as an 'error' event —
     * spawn itself does not throw, so the try/catch around it never sees
     * one. An 'error' event with nothing listening is thrown at the process
     * instead, which would take the whole server down: the window closes
     * the instant it opens and the preview looks broken when it is not.
     * Swallow it. Not being able to launch a browser is not a reason to
     * stop serving; the address is printed just below.
     */
    child.on("error", () => {});
    child.unref();
  } catch {
    /* No browser to launch is not a reason to stop serving. */
  }
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  RS Chef'z preview is running.\n`);
  console.log(`  On this computer:   http://localhost:${PORT}`);
  const lan = lanAddresses();
  if (lan.length) {
    console.log(`\n  On your phone or tablet (same Wi-Fi):`);
    for (const ip of lan) console.log(`                      http://${ip}:${PORT}`);
  } else {
    console.log(`\n  No network address found — phone access needs Wi-Fi.`);
  }
  console.log(`\n  Leave this window open. Press Ctrl+C to stop.\n`);
  if (process.env.NO_OPEN !== "1") openBrowser(`http://localhost:${PORT}`);
});
