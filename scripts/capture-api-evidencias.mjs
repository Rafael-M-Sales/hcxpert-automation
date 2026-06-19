import { chromium } from "playwright";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const today = new Date().toISOString().split("T")[0];
const outDir = resolve(root, "cypress", "evidencias", "api_trello.feature", today);

mkdirSync(outDir, { recursive: true });

const templates = [
  { html: "api-evidence-01.html", output: "01_chamada_valida_200.png" },
  { html: "api-evidence-02.html", output: "02_chamada_invalida_400.png" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  for (const t of templates) {
    const htmlPath = resolve(__dirname, "templates", t.html);
    await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: resolve(outDir, t.output) });
    console.log("  [OK] " + t.output);
  }

  await browser.close();
  console.log("Evidencias da API salvas em: " + outDir);
}

main().catch((err) => {
  console.error("Erro ao gerar evidencias da API:", err.message);
  process.exit(1);
});
