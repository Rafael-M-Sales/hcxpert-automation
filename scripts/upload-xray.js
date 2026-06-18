import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "..", ".env") });

const XRAY_BASE = "https://xray.cloud.getxray.app/api/v2";
const REPORT_PATH = resolve(__dirname, "..", "cypress", "reports", "cucumber-report.json");
const CLIENT_ID = process.env.XRAY_CLIENT_ID;
const CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Erro: XRAY_CLIENT_ID e XRAY_CLIENT_SECRET devem estar definidos no .env");
  process.exit(1);
}

if (!existsSync(REPORT_PATH)) {
  console.error(`Erro: Relatório Cucumber não encontrado em ${REPORT_PATH}`);
  console.error("Execute 'npm test' primeiro para gerar o relatório.");
  process.exit(1);
}

async function authenticate() {
  const res = await fetch(`${XRAY_BASE}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na autenticação Xray (${res.status}): ${text}`);
  }

  const token = await res.text();
  return token.replace(/"/g, "");
}

async function uploadResults(token) {
  const reportContent = readFileSync(REPORT_PATH, "utf-8");
  let results;

  try {
    results = JSON.parse(reportContent);
  } catch {
    throw new Error("Relatório Cucumber JSON inválido");
  }

  const res = await fetch(`${XRAY_BASE}/import/execution/cucumber`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(results),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao importar resultados (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data;
}

(async () => {
  try {
    console.log("Autenticando no Xray...");
    const token = await authenticate();
    console.log("Token obtido com sucesso.");

    console.log("Enviando resultados para o Xray...");
    const result = await uploadResults(token);
    console.log("Resultados importados com sucesso!");
    console.log("Detalhes:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
})();
