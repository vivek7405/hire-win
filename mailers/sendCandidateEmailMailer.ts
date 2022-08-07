/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"

type SendCandidateEmailMailerInput = {
  candidateEmail: string
  senderName: string
  subject: string
  body: string
  cc: string
}

export async function sendCandidateEmailMailer({
  candidateEmail,
  senderName,
  subject,
  body,
  cc,
}: SendCandidateEmailMailerInput) {
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: `"${senderName}" <noreply@hire.win>`,
    to: candidateEmail,
    cc,
    subject,
    html: body,
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
            CC: msg.cc,
            Subject: msg.subject,
            HtmlBody: msg.html,
            TextBody: convert(msg.html),
            MessageStream: "candidate",
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/sendCandidateEmailMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
