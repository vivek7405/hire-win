export class Job {
  static selectors = {
    jobSettingsLink: '[data-testid="Test Job-settingsLink"]',
    jobNameInput: '[data-testid="jobName-input"]',
    submitButton: '[data-testid="jobForm-submitButton"]',
    inviteInput: '[data-testid="inviteEmail-input"]',
    inviteSubmitButton: '[data-testid="inviteForm-submitButton"]',
    specificJobMember: (email: string) => `[data-testid="job-member-${email}"]`,
  }

  static goToJobSettings = () => {
    cy.get(Job.selectors.jobSettingsLink).should("be.visible").click()
    cy.location("pathname").should("include", "jobs/")
  }

  static noSettingsLink = () => {
    cy.get(Job.selectors.jobSettingsLink).should("not.exist")
  }

  static editJobName = (jobNewName: string) => {
    cy.intercept("POST", "**api/auth/mutations/updateJob").as("update")
    cy.get(Job.selectors.jobNameInput)
      .scrollIntoView()
      .should("be.visible")
      .click()
      .clear()
      .type(jobNewName)
      .invoke("value")
      .should("equal", jobNewName)
    cy.get(Job.selectors.submitButton).should("be.visible").click()
    return cy.wait("@update").then(({ response }) => expect(response?.statusCode).to.eq(200))
  }

  static forbiddenAccessToSettings = () => {
    cy.contains("h1", "403").should("be.visible")
    cy.contains("h2", `You don't have permission`).should("be.visible")
  }

  static inviteUser = (email: string) => {
    cy.intercept("POST", "**api/jobs/mutations/inviteToJob").as("invitation")
    cy.get(Job.selectors.inviteInput)
      .scrollIntoView()
      .should("be.visible")
      .clear()
      .type(email)
      .should("have.value", email)
    cy.get(Job.selectors.inviteSubmitButton).should("be.visible").click()
    return cy.wait("@invitation")
  }
}
