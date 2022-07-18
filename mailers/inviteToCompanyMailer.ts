/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db from "db"

type InviteToCompanyInput = {
  to: string
  token: string
  companyId: string
}

export async function inviteToCompanyMailer({ to, token, companyId }: InviteToCompanyInput) {
  const company = await db.company.findUnique({
    where: {
      id: companyId,
    },
  })

  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const webhookUrl = `${origin}/api/invitations/company/accept?token=${token}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to,
    subject: "You have been invited to a company",
    html: `
      <h1>You've been invited to the company - ${company?.name}</h1>

      <a href="${webhookUrl}">
        Click here to accept your invite
      </a>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production" && postmarkServerClient) {
        // send the production email
        try {
          const postmark = require("postmark")
          const client = new postmark.ServerClient(postmarkServerClient)

          client.sendEmail({
            From: msg.from,
            To: msg.to,
            Subject: msg.subject,
            HtmlBody: msg.html,
            TextBody: convert(msg.html),
            MessageStream: "invite-to-company",
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/inviteToCompanyMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
