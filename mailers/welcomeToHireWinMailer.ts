/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db from "db"

type WelcomeToHireWinInput = {
  toEmail: string
  toName: string
  companySlug: string
}

export async function welcomeToHireWinMailer({
  toEmail,
  toName,
  companySlug,
}: WelcomeToHireWinInput) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const careersPageUrl = `${origin}/${companySlug}`
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
              From: `Vivek at Hire.win <support@hire.win>`,
              To: toEmail,
              TemplateAlias: "welcome",
              TemplateModel: {
                name: toName,
                careers_page_url: careersPageUrl,
              },
              MessageStream: "welcome",
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
            const template = await client.getTemplate("welcome")

            let subject = replaceForLocal(template?.Subject, toName, careersPageUrl)
            let html = replaceForLocal(template?.HtmlBody, toName, careersPageUrl)
            const msg = {
              from: `Vivek at Hire.win <support@hire.win>`,
              to: toEmail,
              subject: subject || "",
              html: html || "",
            }

            await previewEmail(msg)
          }
        } else {
          const msg = {
            from: `Vivek at Hire.win <support@hire.win>`,
            to: toEmail,
            subject: "",
            html: "",
          }
          await previewEmail(msg)
        }
      } catch (e) {
        throw new Error(
          "Something went wrong with email implementation in mailers/welcomeToHireWinMailer"
        )
      }
    },
  }
}

function replaceForLocal(msg, toName, careersPageUrl) {
  msg = msg?.replaceAll("{{name}}", toName)
  msg = msg?.replaceAll("{{careers_page_url}}", careersPageUrl)

  return msg
}
