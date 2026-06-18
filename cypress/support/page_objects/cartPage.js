class CartPage {
  visit() {
    cy.visit("/view_cart");
  }

  get cartItems() {
    return cy.get("#cart_info_table tbody tr");
  }

  get cartItemNames() {
    return cy.get(".cart_description a");
  }

  get cartItemPrices() {
    return cy.get(".cart_price p");
  }

  get proceedToCheckoutButton() {
    return cy.contains("Proceed To Checkout");
  }

  clickProceedToCheckout() {
    this.proceedToCheckoutButton.click();
  }

  get checkoutDialog() {
    return cy.get("#checkoutModal");
  }

  get placeOrderButton() {
    return cy.contains("Place Order");
  }

  verifyProductInCart(productName) {
    this.cartItemNames.contains(productName).should("be.visible");
  }
}

export default new CartPage();
