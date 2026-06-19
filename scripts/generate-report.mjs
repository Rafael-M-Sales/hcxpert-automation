import { resolve, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { generate } from "multiple-cucumber-html-reporter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportDir = resolve(__dirname, "..", "cypress", "reports");
const jsonPath = resolve(reportDir, "cucumber-report.json");

if (!existsSync(jsonPath)) {
  console.error(`Relatório JSON não encontrado em ${jsonPath}`);
  console.error("Execute 'npm test' primeiro para gerar o relatório.");
  process.exit(1);
}

generate({
  jsonDir: reportDir,
  reportPath: resolve(reportDir, "html"),
  displayDuration: true,
  durationInMS: false,
  pageTitle: "HCXpert Automation - Relatório de Testes",
  reportName: "HCXpert Automation - Cucumber BDD",
  hideMetadata: false,
  customData: {
    title: "Informações da Execução",
    data: [
      { label: "Projeto", value: "HCXpert Automation" },
      { label: "Ambiente", value: "Produção" },
      { label: "Data", value: new Date().toLocaleString("pt-BR") },
    ],
  },
});

console.log("Relatório HTML gerado em:", resolve(reportDir, "html", "index.html"));
