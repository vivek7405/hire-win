import { LoginPage } from "../../pages/login-page"
import { UserAccountPage } from "../../pages/registered-user-account-page"
import { User } from "../../fixtures/interfaces"

/**
 * @todo migrate seedData from json to TS and calculate these data automatically
 * @todo add data-testid to identify the job list from e.g. the new job button
 */
const userTocheck: User = { email: "test2@test.com", password: "test" }
const jobs = ["Test Job", "Test Job 2", "Test Job 5"]

describe("Job visibility", () => {
  beforeEach(() => {
    cy.visit("/")
    LoginPage.loginViaUI(userTocheck)
  })

  it("check that a user from the seedData file has all and only the jobs he is member of", function () {
    jobs.forEach((job) => {
      UserAccountPage.isJobPresent_lp(job)
    })

    UserAccountPage.returnNumberOfJobsPresent().should("eq", 3)
  })
})
