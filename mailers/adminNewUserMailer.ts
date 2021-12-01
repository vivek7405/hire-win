/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"

type ResetPasswordMailer = {
  to: string
  token: string
}

export function adminNewUserMailer({ to, token }: ResetPasswordMailer) {
  // In production, set NEXT_PUBLIC_APP_URL to your production server origin
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/reset-password?token=${token}`

  const msg = {
    from: "TODO@example.com",
    to,
    subject: "An admin created a new account for you",
    html: `
      <h1>A new account has been created for you.</h1>
     
      <a href="${resetUrl}">
        Click here to set a new password
      </a>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production") {
        // TODO - send the production email, like this:
        // await postmark.sendEmail(msg)
        throw new Error("No production email implementation in mailers/forgotPasswordMailer")
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
