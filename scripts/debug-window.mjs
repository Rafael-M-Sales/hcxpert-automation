import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: false,
  args: ["--window-position=0,0", "--window-size=1366,800"],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
await page.goto("https://www.automationexercise.com/products");

console.log("Browser PID:", browser?.process?.()?.pid || "N/A");
console.log("Aguardando 15s... use esse tempo para rodar: powershell -Command \"...\"");
console.log("Run: Get-Process | Where-Object MainWindowTitle -ne '' | Select-Object Id,ProcessName,@{N='WinTitle';E={`$_.MainWindowTitle.substring(0,[Math]::Min(60,`$_.MainWindowTitle.Length))}}");

await new Promise((r) => setTimeout(r, 30000));
await browser.close();
