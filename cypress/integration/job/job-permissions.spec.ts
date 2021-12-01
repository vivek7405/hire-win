import { LoginPage } from "../../pages/login-page"
import { UserAccountPage } from "../../pages/registered-user-account-page"
import { Job } from "../../pages/job-page"
import { User } from "../../fixtures/interfaces"

const jobOwner: User = { email: "test@test.com", password: "test" }
const jobUser: User = { email: "test2@test.com", password: "test" }
const jobDetails = {
  name: "Test Job",
  slug: "Test - Job",
}

describe("Job permission", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  afterEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it("Job standard user does NOT have editing permission", function () {
    LoginPage.loginViaUI(jobUser)
    UserAccountPage.goToJob(jobDetails.name)
    // Job.goToJobSettings()
    // Job.forbiddenAccessToSettings()
    Job.noSettingsLink()
  })

  it("Owner of job has editing permission", function () {
    LoginPage.loginViaUI(jobOwner)
    UserAccountPage.goToJob(jobDetails.name)
    Job.goToJobSettings()
    cy.get(Job.selectors.jobNameInput).should("be.visible")
  })
})
