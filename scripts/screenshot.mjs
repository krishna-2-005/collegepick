// Full-page screenshots at 375 / 768 / 1280 for design review.
// Usage: pnpm screenshot [/path ...]   (needs the app running; BASE_URL defaults to localhost:3000)
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = process.env.OUT_DIR ?? ".screenshots";
const widths = [375, 768, 1280];
const routes = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["/", "/dev/ui"];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

try {
  for (const route of routes) {
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[/?=&]+/g, "-");
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      // "networkidle" never settles while Next prefetches links; wait for load and fonts instead.
      await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(outDir, `${slug}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`saved ${file}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
