/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"

type ResetPasswordMailer = {
  toEmail: string
  token: string
}

export function forgotPasswordMailer({ toEmail, token }: ResetPasswordMailer) {
  // In production, set NEXT_PUBLIC_APP_URL to your production server origin
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/auth/reset-password?token=${token}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  // const msg = {
  //   from: "Hire.win <noreply@hire.win>",
  //   to,
  //   subject: "Your Password Reset Instructions",
  //   html: `
  //     <h1>Reset Your Hire.win Password</h1>

  //     <a href="${resetUrl}">
  //       Click here to set a new password
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
              From: `Hire.win <noreply@hire.win>`,
              To: toEmail,
              // ReplyTo: fromEmail,
              TemplateAlias: "password-reset",
              TemplateModel: {
                action_url: resetUrl,
              },
              MessageStream: "outbound",
            })

            // client.sendEmail({
            //   From: msg.from,
            //   To: msg.to,
            //   Subject: msg.subject,
            //   HtmlBody: msg.html,
            //   TextBody: convert(msg.html),
            //   MessageStream: "outbound",
            // })
          } else {
            // Preview email in the browser
            const template = await client.getTemplate("password-reset")

            let subject = replaceForLocal(template?.Subject, resetUrl)
            let html = replaceForLocal(template?.HtmlBody, resetUrl)
            const msg = {
              from: `Hire.win <noreply@hire.win>`,
              to: toEmail,
              subject: subject || "",
              html: html || "",
            }

            await previewEmail(msg)
          }
        } else {
          const msg = {
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

function replaceForLocal(msg, resetUrl) {
  msg = msg?.replaceAll("{{action_url}}", resetUrl)

  return msg
}
