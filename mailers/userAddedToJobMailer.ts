/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db from "db"

type UserAddedToJobMailerInput = {
  fromEmail: string
  fromName: string
  toEmail: string
  companyName: string
  companySlug: string
  jobSlug: string
  jobTitle: string
}

export async function userAddedToJobMailer({
  fromEmail,
  fromName,
  toEmail,
  companyName,
  companySlug,
  jobSlug,
  jobTitle,
}: UserAddedToJobMailerInput) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  // const webhookUrl = `${origin}/api/invitations/company/accept?token=${token}`
  const jobURL = `${origin}/${companySlug}/${jobSlug}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  return {
    async send() {
      try {
        if (postmarkServerClient) {
          const postmark = require("postmark")
          const client = new postmark.ServerClient(postmarkServerClient)

          if (process.env.NODE_ENV === "production") {
            // send the production email
            client.sendEmailWithTemplate({
              From: `${companyName} <notifications@hire.win>`,
              To: toEmail,
              ReplyTo: fromEmail,
              TemplateAlias: "added-to-job",
              TemplateModel: {
                invite_sender_name: fromName,
                invite_sender_organization_name: companyName,
                action_url: jobURL,
                job_title: jobTitle,
              },
              MessageStream: "invite",
            })
          } else {
            // Preview email in the browser
            const template = await client.getTemplate("added-to-job")

            let subject = replaceForLocal(
              template?.Subject,
              fromName,
              companyName,
              jobURL,
              jobTitle
            )
            let html = replaceForLocal(template?.HtmlBody, fromName, companyName, jobURL, jobTitle)
            const msg = {
              from: `${companyName} <notifications@hire.win>`,
              to: toEmail,
              subject: subject || "",
              html: html || "",
            }

            await previewEmail(msg)
          }
        } else {
          const msg = {
            from: fromEmail,
            to: toEmail,
            subject: "",
            html: "",
          }
          await previewEmail(msg)
        }
      } catch (e) {
        throw new Error(
          "Something went wrong with email implementation in mailers/inviteToCompanyMailer"
        )
      }
    },
  }
}

function replaceForLocal(msg, fromName, companyName, jobURL, jobTitle) {
  msg = msg?.replaceAll("{{invite_sender_name}}", fromName)
  msg = msg?.replaceAll("{{invite_sender_organization_name}}", companyName)
  msg = msg?.replaceAll("{{action_url}}", jobURL)
  msg = msg?.replaceAll("{{job_title}}", jobTitle)

  return msg
}
