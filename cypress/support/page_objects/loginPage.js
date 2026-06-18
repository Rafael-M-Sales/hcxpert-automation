class LoginPage {
  visit() {
    cy.visit("/login", { failOnStatusCode: false });
  }

  fillEmail(email) {
    cy.get('[data-qa="login-email"]').type(email);
  }

  fillPassword(password) {
    cy.get('[data-qa="login-password"]').type(password);
  }

  clickLoginButton() {
    cy.get('[data-qa="login-button"]').click();
  }

  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.clickLoginButton();
  }

  get loggedInUser() {
    return cy.contains("Logged in as");
  }

  get errorMessage() {
    return cy.contains("Your email or password is incorrect!");
  }
}

export default new LoginPage();
