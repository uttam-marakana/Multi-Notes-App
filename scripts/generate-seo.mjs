import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function readDotEnv() {
  const file = path.resolve(".env");
  if (!fs.existsSync(file)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#"))
      .map((line) => line.match(/^([^=]+)=(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key.trim(), value.trim().replace(/^['"]|['"]$/g, "")]),
  );
}

const env = readDotEnv();
const siteUrl = (process.env.VITE_APP_URL || env.VITE_APP_URL || "").replace(/\/$/, "");

if (!siteUrl || siteUrl.includes("your-domain.com")) {
  console.warn("[seo] VITE_APP_URL is not configured. robots.txt and sitemap.xml will use relative paths until a production URL is supplied.");
}

const baseUrl = siteUrl || "https://example.com";
const dist = path.resolve("dist");
fs.mkdirSync(dist, { recursive: true });

const robots = `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /signup\nDisallow: /forgot-password\nDisallow: /boards\nDisallow: /notes\nDisallow: /trash/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;

fs.writeFileSync(path.join(dist, "robots.txt"), robots);
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

console.log(`[seo] Generated robots.txt and sitemap.xml for ${baseUrl}`);
