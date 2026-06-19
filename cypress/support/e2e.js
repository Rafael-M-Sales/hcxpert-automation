Cypress.on("uncaught:exception", () => {
  return false;
});

function highlightElement($el) {
  $el.css({
    outline: "3px solid red",
    "outline-offset": "2px",
  });
}

function addUrlBar() {
  const bar = document.getElementById("cy-url-bar");
  if (bar) bar.remove();
  document.body.style.marginTop = "";
  const loc = window.location;
  const div = document.createElement("div");
  div.id = "cy-url-bar";
  div.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:32px;background:#1a1a2e;color:#fff;font-family:'Segoe UI',monospace;font-size:13px;display:flex;align-items:center;padding:0 12px;z-index:99999;border-bottom:2px solid #ff6c37;";
  div.innerHTML =
    '<span style="background:#2d2d5e;padding:2px 10px;border-radius:4px;margin-right:10px;font-size:11px;white-space:nowrap;">' +
    loc.protocol +
    "//" +
    loc.host +
    '</span><span style="color:#8af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
    loc.pathname +
    loc.search +
    loc.hash +
    "</span>";
  document.body.prepend(div);
  document.body.style.marginTop = "34px";
}

function removeUrlBar() {
  const bar = document.getElementById("cy-url-bar");
  if (bar) bar.remove();
  document.body.style.marginTop = "";
}

Cypress.Commands.add("evidencia", (nome) => {
  const hoje = new Date().toISOString().split("T")[0];
  cy.window({ log: false }).then(addUrlBar);
  cy.screenshot(`${hoje}/${nome}`, { capture: "viewport" });
  cy.window({ log: false }).then(removeUrlBar);
});

Cypress.Commands.add("evidenciaFP", (nome) => {
  const hoje = new Date().toISOString().split("T")[0];
  cy.window({ log: false }).then(addUrlBar);
  cy.screenshot(`${hoje}/${nome}`, { capture: "fullPage" });
  cy.window({ log: false }).then(removeUrlBar);
});

["click", "type", "select", "check", "clear"].forEach((command) => {
  Cypress.Commands.overwrite(command, (original, subject, ...args) => {
    if (subject && subject.jquery) {
      highlightElement(subject);
    }
    return original(subject, ...args);
  });
});
