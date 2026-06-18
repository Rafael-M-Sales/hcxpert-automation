Cypress.on("uncaught:exception", () => {
  return false;
});

function highlightElement($el) {
  const prev = {
    outline: $el.css("outline"),
    "outline-offset": $el.css("outline-offset"),
  };
  $el.css({
    outline: "3px solid red",
    "outline-offset": "2px",
  });
  setTimeout(() => {
    $el.css(prev);
  }, 500);
}

Cypress.Commands.add("evidencia", (nome) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  cy.screenshot(`${timestamp}_${nome}`);
});

["click", "type", "select", "check", "clear"].forEach((command) => {
  Cypress.Commands.overwrite(command, (original, subject, ...args) => {
    if (subject && subject.jquery) {
      highlightElement(subject);
    }
    return original(subject, ...args);
  });
});
