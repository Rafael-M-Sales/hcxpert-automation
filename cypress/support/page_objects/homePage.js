class HomePage {
  visit() {
    cy.visit("/");
  }

  get signupLoginLink() {
    return cy.contains("Signup / Login");
  }

  get logoutLink() {
    return cy.contains("Logout");
  }

  get loggedInAs() {
    return cy.contains("Logged in as");
  }
}

export default new HomePage();
