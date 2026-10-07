import { readFile } from "node:fs/promises";
import path from "node:path";

import { PWA_ICON_SRC } from "@/lib/brand";

function siteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw}`;
}

/** Prefer a small raster for favicons when the asset is on Cloudinary. */
function iconFetchUrl(src: string, size: number): string {
  const cloudinary =
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i.exec(src);
  if (cloudinary) {
    const [, prefix, rest] = cloudinary;
    // Avoid double-transform if already transformed.
    if (/\/upload\/(?:[^/]+,)+/.test(src)) return src;
    return `${prefix}w_${size},h_${size},c_fit,b_transparent,f_png,q_auto/${rest}`;
  }
  if (src.startsWith("/")) return `${siteOrigin()}${src}`;
  return src;
}

function guessContentType(url: string, header: string | null): string {
  if (header && header.startsWith("image/")) return header.split(";")[0]!.trim();
  const lower = url.toLowerCase();
  if (lower.includes(".svg")) return "image/svg+xml";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "image/jpeg";
  return "image/png";
}

async function fetchImage(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      // Avoid Next data-cache oddities for binary icons.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    if (!bytes.byteLength) return null;
    return new Response(bytes, {
      headers: {
        "Content-Type": guessContentType(url, res.headers.get("content-type")),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return null;
  }
}

async function readPackagedIcon(): Promise<Response | null> {
  try {
    const file = path.join(process.cwd(), "public", "icons", "icon-512x512.png");
    const bytes = await readFile(file);
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return null;
  }
}

/**
 * Favicon and Apple touch icon. Always the packaged HG Alutek square,
 * so a stored company logo cannot put the old mark on the installed app.
 */
export async function serveBrandIconResponse(size = 64): Promise<Response> {
  const packaged = await readPackagedIcon();
  if (packaged) return packaged;

  const candidates = [iconFetchUrl(PWA_ICON_SRC, size)];

  for (const url of candidates) {
    const res = await fetchImage(url);
    if (res) return res;
  }

  // Tiny SVG lettermark only if every fetch failed.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0342ab"/><text x="32" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">HG</text></svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
  });
}
