/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"

type UserAddedToJobInput = {
  toEmail: string
  toName: string
  addedByUserEmail: string
  addedByUserName: string
  jobTitle: string
  companyName: string
}

export async function userAddedToJobMailer({
  toEmail,
  toName,
  addedByUserEmail,
  addedByUserName,
  jobTitle,
  companyName,
}: UserAddedToJobInput) {
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to: toEmail,
    subject: "You have been added to a job",
    html: `
      Hi ${toName},
      
      ${addedByUserName} from ${companyName} added you to the job ${jobTitle}.

      You may reach out to them at ${addedByUserEmail} for any concerns.
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
            MessageStream: "invite",
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/inviteToJobMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
