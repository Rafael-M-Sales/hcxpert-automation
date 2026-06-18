class ProductsPage {
  visit() {
    cy.visit("/products");
  }

  get searchInput() {
    return cy.get("#search_product");
  }

  get searchButton() {
    return cy.get("#submit_search");
  }

  search(productName) {
    this.searchInput.type(productName);
    this.searchButton.click();
  }

  get searchedProducts() {
    return cy.get(".features_items .product-image-wrapper");
  }

  get noProductsMessage() {
    return cy.contains("Products not found");
  }

  get firstProductAddToCart() {
    return cy.get(".features_items .product-image-wrapper")
      .first()
      .find(".overlay-content .btn.add-to-cart");
  }

  get firstProductName() {
    return cy.get(".features_items .product-image-wrapper")
      .first()
      .find(".productinfo p");
  }

  get firstProductPrice() {
    return cy.get(".features_items .product-image-wrapper")
      .first()
      .find(".productinfo h2");
  }

  addFirstProductToCart() {
    cy.get(".features_items .product-image-wrapper")
      .first()
      .trigger("mouseover")
      .find(".overlay-content .btn.add-to-cart")
      .click({ force: true });
  }

  get modalContinueShopping() {
    return cy.contains("Continue Shopping");
  }

  clickContinueShopping() {
    this.modalContinueShopping.click();
  }

  get modalViewCart() {
    return cy.contains("View Cart");
  }

  clickViewCart() {
    this.modalViewCart.click();
  }
}

export default new ProductsPage();
