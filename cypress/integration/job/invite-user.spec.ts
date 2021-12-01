import { LoginPage } from "../../pages/login-page"
import { UserAccountPage } from "../../pages/registered-user-account-page"
import { Job } from "../../pages/job-page"
import { User } from "../../fixtures/interfaces"

const jobOwner: User = { email: "test@test.com", password: "test" }
const invitedUser: User = { email: "test7@test.com", password: "test" }

const jobDetails = {
  name: "Test Job",
  slug: "Test-Job",
}

describe("Job invitation", () => {
  beforeEach(() => {
    cy.visit("/")
    LoginPage.loginViaUI(jobOwner)
    UserAccountPage.goToJob(jobDetails.name)
    Job.goToJobSettings()
    cy.contains("a", "Members").scrollIntoView().should("be.visible").click()
    cy.get('[data-testid="open-inviteUser-modal"]').click()
  })

  it("Job owner invites user", function () {
    Job.inviteUser(invitedUser.email).then(
      ({
        response: {
          body: { result },
        },
      }) => {
        // logout
        cy.clearLocalStorage()
        cy.clearCookies()
        // guest user accepting invitatation clicking on link
        cy.visit(result)
        LoginPage.loginViaUI(invitedUser)
        cy.location("pathname").should("contain", `jobs/${jobDetails.slug}`)
        UserAccountPage.isJobPresent(jobDetails.slug)
        UserAccountPage.logout()
        LoginPage.loginViaUI(jobOwner)
        UserAccountPage.goToJob(jobDetails.name)
        Job.goToJobSettings()
        cy.contains("a", "Members").scrollIntoView().should("be.visible").click()
        cy.get(Job.selectors.specificJobMember(invitedUser.email)).should("be.visible")
      }
    )
  })
})
