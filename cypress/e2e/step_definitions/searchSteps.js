import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import productsPage from "../../support/page_objects/productsPage";

Given("que estou na página de produtos", () => {
  productsPage.visit();
});

When("busco pelo produto {string}", (productName) => {
  productsPage.search(productName);
});

Then("devo ver resultados de busca para {string}", (productName) => {
  productsPage.searchedProducts.should("have.length.greaterThan", 0);
  cy.contains(productName).should("be.visible");
});

Then("não deve haver resultados de busca", () => {
  cy.get(".features_items").find(".product-image-wrapper").should("not.exist");
});
