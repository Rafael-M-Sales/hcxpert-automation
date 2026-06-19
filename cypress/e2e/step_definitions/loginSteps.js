import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import loginPage from "../../support/page_objects/loginPage";
import homePage from "../../support/page_objects/homePage";

Given("que estou na página de login", () => {
  loginPage.visit();
});

When("preencho o campo email com {string}", (email) => {
  loginPage.fillEmail(email);
});

When("preencho o campo senha com {string}", (password) => {
  loginPage.fillPassword(password);
});

When("clico no botão Login", () => {
  loginPage.clickLoginButton();
});

Then("devo ser redirecionado para a página inicial", () => {
  cy.url().should("include", "/");
});

Then("devo ver a mensagem {string}", (message) => {
  cy.contains(message).should("be.visible");
});

Then("devo ver a mensagem de erro {string}", (message) => {
  loginPage.errorMessage.should("contain", message);
});
