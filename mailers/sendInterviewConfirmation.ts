/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db, { Candidate, Interview, InterviewDetail, User } from "db"
import { createICalendarEvent } from "app/scheduling/interviews/utils/createCalendarEvent"

type SendInterviewConfirmationInput = {
  interview: Interview & { interviewDetail: InterviewDetail & { interviewer: User } } & {
    candidate: Candidate
  }
  cancelLink: string
}

export async function sendInterviewConfirmation({
  interview,
  cancelLink,
}: SendInterviewConfirmationInput) {
  // const job = await db.job.findUnique({
  //     where: {
  //         id: jobId,
  //     },
  // })

  // const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  // const webhookUrl = `${origin}/api/invitations/accept?token=${token}&jobId=${job?.id}`
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to: interview?.candidate?.email,
    subject: "Interview confirmation",
    html: `
      <h1>Your interview has been scheduled with ${interview?.interviewDetail?.interviewer?.name}.</h1>
      <br />
      <p>You must have got a meeting invite. If not, contact the interviewer on the following email: ${interview?.interviewDetail?.interviewer?.email}</p>
      <br />
      <p>You may cancel the meeting by clicking on the following link: ${cancelLink}</p>
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
            MessageStream: "send-meeting-confirmation",
            Attachments: [
              {
                Name: "appointment.ics",
                Content: createICalendarEvent(interview),
                ContentType: "text/calendar",
              },
            ],
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/sendInterviewConfirmation"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
