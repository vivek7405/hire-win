/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db, { Interview, InterviewDetail, User } from "db"

type SendInterviewReminderMailerInput = {
  to: string
  interview: Interview & { interviewer: User }
}

export async function sendInterviewReminderMailer({
  to,
  interview,
}: SendInterviewReminderMailerInput) {
  // const job = await db.job.findUnique({
  //     where: {
  //         id: jobId,
  //     },
  // })

  // const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to,
    subject: "Interview reminder",
    html: `
      <h1>You have an interview with ${interview?.interviewer?.name} in 1 hour</h1>
      <br />
      <p>You must have got a meeting invite. If not, contact the interviewer on the following email: ${interview?.interviewer?.email}</p>
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
            MessageStream: "send-meeting-reminder",
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/sendInterviewReminderMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
