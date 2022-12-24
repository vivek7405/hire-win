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
  fromEmail: string
  fromName: string
  toEmail: string
  token: string
  companyId: string
  companyName: string
}

export async function inviteToCompanyMailer({
  fromEmail,
  fromName,
  toEmail,
  token,
  companyId,
  companyName,
}: InviteToCompanyInput) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const webhookUrl = `${origin}/api/invitations/company/accept?token=${token}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  // const msg = {
  //   from: "noreply@hire.win",
  //   to,
  //   subject: "You have been invited to a company",
  //   html: `
  //     <h1>You've been invited to the company - ${company?.name}</h1>

  //     <a href="${webhookUrl}">
  //       Click here to accept your invite
  //     </a>
  //   `,
  // }

  return {
    async send() {
      try {
        if (postmarkServerClient) {
          const postmark = require("postmark")
          const client = new postmark.ServerClient(postmarkServerClient)

          if (process.env.NODE_ENV === "production") {
            // send the production email
            client.sendEmailWithTemplate({
              From: fromEmail,
              To: toEmail,
              TemplateAlias: "invite-to-company",
              TemplateModel: {
                invite_sender_name: fromName,
                invite_sender_organization_name: companyName,
                action_url: webhookUrl,
              },
              MessageStream: "invite",
            })

            // client.sendEmail({
            //   From: msg.from,
            //   To: msg.to,
            //   Subject: msg.subject,
            //   HtmlBody: msg.html,
            //   TextBody: convert(msg.html),
            //   MessageStream: "invite",
            // })
          } else {
            // Preview email in the browser
            const template = await client.getTemplate("invite-to-company")

            let subject = replaceForLocal(template?.Subject, fromName, companyName, webhookUrl)
            let html = replaceForLocal(template?.HtmlBody, fromName, companyName, webhookUrl)
            const msg = {
              from: fromEmail,
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

function replaceForLocal(msg, fromName, companyName, webhookUrl) {
  msg = msg?.replaceAll("{{invite_sender_name}}", fromName)
  msg = msg?.replaceAll("{{invite_sender_organization_name}}", companyName)
  msg = msg?.replaceAll("{{action_url}}", webhookUrl)

  return msg
}
