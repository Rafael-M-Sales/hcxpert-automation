import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("envio uma requisição GET para {string}", (url) => {
  cy.request({
    url,
    failOnStatusCode: false,
  }).as("apiResponse");
});

Then("o status code da resposta deve ser {int}", (statusCode) => {
  cy.get("@apiResponse").its("status").should("eq", statusCode);
});

Then('o campo "name" da estrutura "list" deve conter {string}', (expectedName) => {
  cy.get("@apiResponse").then((response) => {
    expect(response.body.data.list.name).to.contain(expectedName);
  });
});
