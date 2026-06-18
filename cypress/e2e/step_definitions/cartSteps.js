import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import loginPage from "../../support/page_objects/loginPage";
import productsPage from "../../support/page_objects/productsPage";
import cartPage from "../../support/page_objects/cartPage";

Given("que estou logado no sistema", () => {
  loginPage.visit();
  loginPage.login("teste2024@teste.com.br", "teste");
});

Given("que estou na página de produtos sem estar logado", () => {
  productsPage.visit();
});

When("adiciono o primeiro produto ao carrinho", () => {
  productsPage.addFirstProductToCart();
});

Then("o produto deve ser adicionado ao carrinho com sucesso", () => {
  cy.contains("Added!").should("be.visible");
  productsPage.modalContinueShopping.should("be.visible");
  productsPage.clickContinueShopping();
});

Then("o produto é adicionado ao carrinho como visitante", () => {
  cy.contains("Added!").should("be.visible");
  productsPage.modalContinueShopping.should("be.visible");
  productsPage.clickContinueShopping();
});

When("acesso o carrinho de compras", () => {
  cartPage.visit();
});

Then("devo ver o produto adicionado na lista do carrinho", () => {
  cartPage.cartItems.should("have.length.greaterThan", 0);
});

Then("o nome e preço do produto devem estar corretos", () => {
  cartPage.cartItemNames.should("not.be.empty");
  cartPage.cartItemPrices.should("not.be.empty");
});

When("clico em {string}", (buttonText) => {
  cy.contains(buttonText).click();
});

Then("devo ser direcionado para a tela de pagamento", () => {
  cy.contains("Review Your Order").should("be.visible");
});

Then("devo ver o resumo do pedido com o produto", () => {
  cy.get("#cart_info").should("be.visible");
});
