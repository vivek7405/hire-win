/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"

type ConfirmEmailInput = {
  to: string
  token: string
}

export async function confirmEmailMailer({ to, token }: ConfirmEmailInput) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const webhookUrl = `${origin}/api/signup?token=${token}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to,
    subject: "Signup confirmation - hire.win",
    html: `
      <h1>This is a signup confirmation email from hire.win</h1>
      <br />
      <h3>Make sure you click on the signup link only if you have requested for signing up from our site.</h3>

      <br /><br />

      <a href="${webhookUrl}">
        Click here to signup
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
            MessageStream: "outbound",
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/confirmEmailMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
