import { chromium } from "playwright";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const ps1 = resolve(__dirname, "capture-chrome-window.ps1");
const BASE = "https://www.automationexercise.com";
const EMAIL = "teste2024@teste.com.br";
const PASSWORD = "teste";

const today = new Date().toISOString().split("T")[0];

const AD_DOMAINS = [
  "doubleclick.net", "googlesyndication.com", "googleadservices.com",
  "googleads.g.doubleclick.net", "pagead2.googlesyndication.com",
  "adservice.google.com", "googlesyndication.com/safeframe",
  "fundingchoicesmessages.google.com",
];

function outDir(specName) {
  const d = resolve(root, "cypress", "evidencias", specName, today);
  mkdirSync(d, { recursive: true });
  return d;
}

function captureDesktop(folder, name) {
  const out = resolve(folder, `manual_${name}.png`);
  const cmd = `powershell -ExecutionPolicy Bypass -File "${ps1}" -Output "${out}"`;
  execSync(cmd, { timeout: 15000 });
  console.log(`  [OK] manual_${name}.png`);
}

function blockAds(page) {
  page.on("popup", (popup) => {
    console.log("  Fechando popup:", popup.url().slice(0, 60));
    popup.close();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
}

async function login(page) {
  await goto(page, `${BASE}/login`);
  await page.waitForTimeout(800);
  await page.fill('[data-qa="login-email"]', EMAIL);
  await page.fill('[data-qa="login-password"]', PASSWORD);
  await page.click('[data-qa="login-button"]');
  await page.waitForTimeout(1500);
}

function removeAdsFromDom(page) {
  page.evaluate(() => {
    const adSelectors = [
      "iframe[src*='doubleclick']", "iframe[src*='googleads']",
      "iframe[src*='googlesyndication']", "ins.adsbygoogle",
      "div[id*='google_ads']", "div[class*='adsbygoogle']",
      "div[class*='ad-wrap']", "div[class*='ad-container']",
      "div[class*='advertisement']", "div[class*='ad-banner']",
      "img[alt*='ad']", "img[alt*='Advertisement']",
      "a[href*='doubleclick']", "a[href*='googlesyndication']",
      ".google-auto-placed", "#google_ads_frame",
    ];
    adSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }).catch(() => {});
}

async function drawRedOutline(page, locator) {
  await locator.evaluate((el) => {
    el.style.outline = "4px solid red";
    el.style.outlineOffset = "2px";
  });
}

async function closeModal(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const btn = document.querySelector(".close-modal.btn-block");
    if (btn) btn.click();
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) backdrop.remove();
    const modal = document.querySelector(".modal");
    if (modal) modal.style.display = "none";
  });
  await page.waitForTimeout(500);
}

async function addToCartFlow(page, loggedIn) {
  const dir = outDir("add_to_cart.feature");
  const suffix = loggedIn ? "" : "_visitante";

  await goto(page, `${BASE}/products`);
  await page.waitForTimeout(1000);

  const firstProduct = page.locator(".features_items .product-image-wrapper").first();
  const singleProducts = firstProduct.locator(".single-products");

  // Step 1: Show item that will be selected
  await singleProducts.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, `01_item_visivel${suffix}`);

  // Step 2: Hover action showing overlay
  await singleProducts.hover();
  await page.waitForTimeout(500);
  await singleProducts.locator(".product-overlay").evaluate((el) => {
    el.style.height = "100%";
  });
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, `02_overlay_laranja${suffix}`);

  // Step 3: Click add to cart with red outline
  await singleProducts.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await drawRedOutline(page, singleProducts);
  captureDesktop(dir, `03_adicionado_contorno${suffix}`);

  await firstProduct.locator(".overlay-content .btn.add-to-cart").click({ force: true });
  await page.waitForTimeout(800);
  await closeModal(page);

  // Step 4: Item in cart (result)
  await goto(page, `${BASE}/view_cart`);
  await page.waitForTimeout(1000);
  try {
    await page.locator("#cart_info_table").scrollIntoViewIfNeeded({ timeout: 5000 });
  } catch {
    await page.locator("table").first().scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, `04_item_no_carrinho${suffix}`);
}

async function loginFlow(page) {
  const dir = outDir("login.feature");

  console.log("\n--- Login valido ---");
  // Step 1: Show login form (item to interact)
  await goto(page, `${BASE}/login`);
  await page.waitForTimeout(800);
  await page.locator('[data-qa="login-email"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "01_item_formulario");

  // Step 2: Fill form (action)
  await page.fill('[data-qa="login-email"]', EMAIL);
  await page.fill('[data-qa="login-password"]', PASSWORD);
  await page.waitForTimeout(300);
  await page.locator('[data-qa="login-email"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "02_formulario_preenchido");

  // Step 3: Click login with red outline
  const loginBtn = page.locator('[data-qa="login-button"]');
  await loginBtn.scrollIntoViewIfNeeded();
  await drawRedOutline(page, loginBtn);
  captureDesktop(dir, "03_clique_login_contorno");

  await loginBtn.click();
  await page.waitForTimeout(2000);

  // Step 4: Result - success
  await page.locator("header").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "04_login_sucesso");

  console.log("\n--- Login invalido ---");
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.context().clearCookies();
  await goto(page, `${BASE}/login`);
  await page.waitForTimeout(1000);
  try {
    await page.fill('[data-qa="login-email"]', "invalido@email.com");
    await page.fill('[data-qa="login-password"]', "senhaerrada");
  } catch (e) {
    await goto(page, `${BASE}/login`);
    await page.waitForTimeout(1000);
    await page.fill('[data-qa="login-email"]', "invalido@email.com");
    await page.fill('[data-qa="login-password"]', "senhaerrada");
  }
  await page.waitForTimeout(300);
  await page.locator('[data-qa="login-email"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "05_item_formulario_invalido");

  await page.locator('[data-qa="login-email"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "06_formulario_invalido_preenchido");

  const loginBtn2 = page.locator('[data-qa="login-button"]');
  await loginBtn2.scrollIntoViewIfNeeded();
  await drawRedOutline(page, loginBtn2);
  captureDesktop(dir, "07_clique_login_invalido_contorno");

  await loginBtn2.click();
  await page.waitForTimeout(2000);
  await page.locator('[data-qa="login-email"]').scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "08_login_erro");
}

async function searchFlow(page) {
  const dir = outDir("search.feature");

  console.log("\n--- Busca produto existente ---");
  // Step 1: Show search bar
  await goto(page, `${BASE}/products`);
  await page.waitForTimeout(800);
  await page.locator("#search_product").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "01_item_busca");

  // Step 2: Type search term (action)
  await page.fill("#search_product", "Blue Top");
  await page.waitForTimeout(300);
  await page.locator("#search_product").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "02_termo_busca");

  // Step 3: Click search with red outline
  const searchBtn = page.locator("#submit_search");
  await searchBtn.scrollIntoViewIfNeeded();
  await drawRedOutline(page, searchBtn);
  captureDesktop(dir, "03_clique_busca_contorno");

  await searchBtn.click();
  await page.waitForTimeout(1000);

  // Step 4: Results
  await page.locator(".features_items").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "04_resultados_encontrados");

  console.log("\n--- Busca produto inexistente ---");
  await goto(page, `${BASE}/products`);
  await page.waitForTimeout(800);
  await page.locator("#search_product").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "05_item_busca_inexistente");

  await page.fill("#search_product", "ProdutoInexistenteXYZ123");
  await page.waitForTimeout(300);
  await page.locator("#search_product").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  removeAdsFromDom(page);
  captureDesktop(dir, "06_termo_busca_inexistente");

  const searchBtn2 = page.locator("#submit_search");
  await searchBtn2.scrollIntoViewIfNeeded();
  await drawRedOutline(page, searchBtn2);
  captureDesktop(dir, "07_clique_busca_inexistente_contorno");

  await searchBtn2.click();
  await page.waitForTimeout(1000);
  await page.locator(".features_items").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "08_sem_resultados");
}

async function checkoutFlow(page) {
  const dir = outDir("checkout.feature");

  await login(page);
  await goto(page, `${BASE}/products`);
  await page.waitForTimeout(800);
  const firstProduct = page.locator(".features_items .product-image-wrapper").first();
  await firstProduct.locator(".overlay-content .btn.add-to-cart").click({ force: true });
  await page.waitForTimeout(800);
  await closeModal(page);

  console.log("\n--- Carrinho com produto ---");
  // Step 1: Show cart with product
  await goto(page, `${BASE}/view_cart`);
  await page.waitForTimeout(1000);
  await page.locator("#cart_info_table").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "01_item_carrinho");

  // Step 2: Hover on proceed to checkout (action)
  const proceedBtn = page.locator("a:has-text('Proceed To Checkout')");
  await proceedBtn.scrollIntoViewIfNeeded();
  await proceedBtn.hover();
  await page.waitForTimeout(500);
  removeAdsFromDom(page);
  captureDesktop(dir, "02_checkout_hover");

  // Step 3: Click with red outline
  await proceedBtn.scrollIntoViewIfNeeded();
  await drawRedOutline(page, proceedBtn);
  captureDesktop(dir, "03_clique_checkout_contorno");

  await proceedBtn.click();
  await page.waitForTimeout(3000);

  // Step 4: Payment page (result)
  try {
    await page.locator("#cart_info").scrollIntoViewIfNeeded({ timeout: 5000 });
  } catch {
    await page.locator("text=Review Your Order").scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(300);
  removeAdsFromDom(page);
  captureDesktop(dir, "04_pagamento_resumo");
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ["--window-position=0,0", "--window-size=1366,800"],
  });

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 700 } });

  await ctx.route("**/*", async (route) => {
    const url = route.request().url().toLowerCase();
    if (AD_DOMAINS.some((d) => url.includes(d))) {
      await route.abort();
    } else {
      await route.continue();
    }
  });

  const page = await ctx.newPage();
  blockAds(page);

  console.log("Aguardando 2s para janela estabilizar...");
  await sleep(2000);

  await goto(page, `${BASE}/login`);
  await page.waitForTimeout(500);

  console.log("\n====== ADD TO CART (LOGADO) ======");
  await login(page);
  await addToCartFlow(page, true);

  console.log("\n====== ADD TO CART (VISITANTE) ======");
  await ctx.clearCookies();
  await goto(page, `${BASE}/`);
  await page.waitForTimeout(500);
  await addToCartFlow(page, false);

  console.log("\n====== LOGIN ======");
  await ctx.clearCookies();
  await loginFlow(page);

  console.log("\n====== SEARCH ======");
  await searchFlow(page);

  console.log("\n====== CHECKOUT ======");
  await checkoutFlow(page);

  await browser.close();
  console.log("\nTodas as evidencias manuais foram geradas.");
}

main().catch((err) => {
  console.error("ERRO FATAL:", err.message);
  process.exit(1);
});
