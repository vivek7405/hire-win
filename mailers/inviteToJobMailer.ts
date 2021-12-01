/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import db from "db"

type InviteToJobInput = {
  to: string
  token: string
  jobId: string
}

export async function inviteToJobMailer({ to, token, jobId }: InviteToJobInput) {
  const job = await db.job.findUnique({
    where: {
      id: jobId,
    },
  })

  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const webhookUrl = `${origin}/api/invitations/accept?token=${token}&jobId=${job?.id}`

  const msg = {
    from: "TODO@example.com",
    to,
    subject: "You have been invited to a job",
    html: `
      <h1>You've been invited to ${job?.name}</h1>

      <a href="${webhookUrl}">
        Click here to accept your invite
      </a>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production") {
        // TODO - send the production email, like this:
        // await postmark.sendEmail(msg)
        throw new Error("No production email implementation in mailers/inviteToJobMailer")
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
