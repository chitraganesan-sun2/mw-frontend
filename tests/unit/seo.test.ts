import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

const sitemapUrls = [...read("public/sitemap.xml").replace(/<!--[\s\S]*?-->/g, "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

test("every sitemap entry is an absolute https URL on the production domain, with no duplicates", () => {
    assert.ok(sitemapUrls.length > 0);
    for (const url of sitemapUrls) assert.match(url, /^https:\/\/melodywings\.org(\/|$)/);
    assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
});

test("utility, payment and non-content pages are kept out of the sitemap", () => {
    for (const hidden of ["/delete-account", "/donate/success", "/dev-login", "/blogs"]) {
        assert.ok(!sitemapUrls.some((u) => u.endsWith(hidden)), `${hidden} should not be listed`);
    }
});

test("the pages that matter for discovery are listed", () => {
    for (const page of ["/", "/about-us", "/donate", "/join-us", "/contact"]) {
        assert.ok(sitemapUrls.includes(`https://melodywings.org${page === "/" ? "/" : page}`), `${page} missing`);
    }
});

test("robots.txt points crawlers at the sitemap and does not block the public site", () => {
    const robots = read("public/robots.txt");
    assert.match(robots, /Sitemap: https:\/\/melodywings\.org\/sitemap\.xml/);
    assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
});

test("the link-preview image is a real 1200x630 PNG and is what SHARE_IMAGES points at", () => {
    const png = readFileSync(new URL("public/og-image.png", root));
    assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    assert.ok(png.length < 300 * 1024, "keep the share image small so previews load fast");
    assert.match(read("src/constants/seo.ts"), /url: "\/og-image\.png",\s*width: 1200,\s*height: 630/);
});

// A page's own `openGraph` replaces the root one (no deep merge), so it must carry the image itself.
test("every page that sets its own openGraph also sets the share image", () => {
    const walk = (dir: URL): URL[] =>
        readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
            e.isDirectory() ? walk(new URL(`${e.name}/`, dir)) : /\.tsx?$/.test(e.name) ? [new URL(e.name, dir)] : []
        );
    const withOpenGraph = walk(new URL("src/app/", root)).filter((f) => /openGraph:\s*\{/.test(readFileSync(f, "utf8")));
    assert.ok(withOpenGraph.length >= 5, "expected the root layout and the public pages to be found");
    for (const file of withOpenGraph) {
        assert.match(readFileSync(file, "utf8"), /images:\s*SHARE_IMAGES/, `${file.pathname} sets openGraph without the share image`);
    }
});

test("the root layout ships structured data for the organisation", () => {
    const layout = read("src/app/layout.tsx");
    assert.match(layout, /"@type": "NGO"/);
    assert.match(layout, /application\/ld\+json/);
});
