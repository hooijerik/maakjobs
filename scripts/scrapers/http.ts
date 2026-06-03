// Shared HTTP helpers for scrapers. Uses global fetch (Node 20+).

import zlib from "node:zlib";

const UA = "maakjobs.nl/1.0 (+https://maakjobs.nl; technische vacatures index; contact: team@maakjobs.nl)";

/** Some CDNs return compressed bodies that fetch doesn't auto-decompress. Handle it. */
function maybeDecompress(buf: Buffer, encoding: string | null): Buffer {
  const ce = (encoding || "").toLowerCase();
  try {
    if (ce.includes("br")) return zlib.brotliDecompressSync(buf);
    if (ce.includes("gzip") || (buf[0] === 0x1f && buf[1] === 0x8b)) return zlib.gunzipSync(buf);
    if (ce.includes("deflate")) {
      try {
        return zlib.inflateSync(buf);
      } catch {
        return zlib.inflateRawSync(buf);
      }
    }
  } catch {
    /* fall through - return raw buffer */
  }
  // Gzip magic bytes even when the header is missing
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    try {
      return zlib.gunzipSync(buf);
    } catch {
      /* ignore */
    }
  }
  // Last resort: body doesn't look like text/JSON - try brotli (no magic bytes), then deflate.
  const first = buf[0];
  const looksText =
    first === 0x7b || first === 0x5b || first === 0x20 || first === 0x0a || first === 0x09 || first === 0xef;
  if (!looksText && buf.length > 2) {
    for (const fn of [zlib.brotliDecompressSync, zlib.inflateSync, zlib.inflateRawSync]) {
      try {
        const out = fn(buf);
        if (out && out.length) return out;
      } catch {
        /* try next */
      }
    }
  }
  return buf;
}

export interface FetchOpts {
  timeout?: number;
  headers?: Record<string, string>;
}

export async function fetchText(url: string, opts: FetchOpts = {}): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout ?? 20000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        ...opts.headers,
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} - ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return maybeDecompress(buf, res.headers.get("content-encoding")).toString("utf8");
  } finally {
    clearTimeout(t);
  }
}

export async function fetchJson<T = unknown>(url: string, opts: FetchOpts = {}): Promise<T> {
  const txt = await fetchText(url, { ...opts, headers: { Accept: "application/json", ...opts.headers } });
  return JSON.parse(txt) as T;
}

/** Decode HTML entities (Greenhouse `content` is entity-encoded HTML). */
export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function toIso(value: unknown): string | undefined {
  if (value == null) return undefined;
  const d = typeof value === "number" ? new Date(value) : new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
