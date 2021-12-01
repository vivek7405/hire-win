export class UserAccountPage {
  static selectors = {
    logoutButton: '[data-testid="Sign Out-navLink"]',
    mobileMenu: '[data-testid="openMobileMenu"]',
    createNewWorkSpaceLink: '[data-testid="newJobLink"]',
    genericJobInLandingPage: 'a[href^="/jobs/"]',
  }

  static goToJob = (jobname: string) => {
    if (jobname) {
      cy.wait(3000)
      cy.contains("a", jobname).scrollIntoView().should("be.visible").click()
    }
  }

  static logout = () => {
    cy.intercept("POST", "**/api/auth/mutations/logout").as("logout")
    cy.get(UserAccountPage.selectors.mobileMenu).should("be.visible").click()
    cy.get(UserAccountPage.selectors.logoutButton).should("be.visible").click()
    return cy.wait("@logout").then(({ response }) => expect(response?.statusCode).to.eq(200))
  }

  static isJobPresent = (slug: string) => cy.contains("span", slug).should("be.visible")

  static isJobPresent_lp = (name: string) =>
    cy.contains(UserAccountPage.selectors.genericJobInLandingPage, name).should("be.visible")

  static returnNumberOfJobsPresent = () => cy.get('[data-testid="joblink"]').its("length")
}
