/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import previewEmail from "preview-email"
import { convert } from "html-to-text"
import db, { Candidate, Interview, Job, User } from "db"
import { createICalendarEvent } from "src/interviews/utils/createCalendarEvent"
import { InterviewDetailType } from "types"

type SendInterviewConfirmationMailerInput = {
  interview: Interview & { job: Pick<Job, "title"> } & {
    candidate: Pick<Candidate, "email" | "name">
  } & { organizer: Pick<User, "email"> }
  interviewer: User
  duration: number
  organizer: Pick<User, "email" | "name">
  otherAttendees: Pick<User, "email" | "name">[]
  cancelLink: string
}

export async function sendInterviewConfirmationMailer({
  interview,
  interviewer,
  duration,
  organizer,
  otherAttendees,
  cancelLink,
}: SendInterviewConfirmationMailerInput) {
  // const job = await db.job.findUnique({
  //     where: {
  //         id: jobId,
  //     },
  // })

  // const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const postmarkServerClient = process.env.POSTMARK_TOKEN || null

  const msg = {
    from: "noreply@hire.win",
    to: interview?.candidate?.email,
    subject: `Interview scheduled for ${interview?.job?.title}`,
    html: `
      <h1>Your interview has been scheduled for ${interview?.job?.title}.</h1>
      <br />
      <p>You must have got a meeting invite. You may join the meeting here: ${interview?.meetingLink}</p>
      <br />
      <p>For any queries, contact the organiser: ${interview?.organizer?.email}</p>
      <br />
      <p>You may cancel the meeting here: ${cancelLink}</p>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production" && postmarkServerClient) {
        // send the production email
        try {
          const postmark = require("postmark")
          const client = new postmark.ServerClient(postmarkServerClient)
          const attachmentContent = await createICalendarEvent(
            interview,
            interviewer,
            duration,
            organizer,
            otherAttendees
          )

          client.sendEmail({
            From: msg.from,
            To: msg.to,
            Subject: msg.subject,
            HtmlBody: msg.html,
            TextBody: convert(msg.html),
            MessageStream: "interview",
            Attachments: [
              {
                Name: "appointment.ics",
                Content: attachmentContent,
                ContentType: "text/calendar",
              },
            ],
          })
        } catch (e) {
          throw new Error(
            "Something went wrong with email implementation in mailers/sendInterviewConfirmationMailer"
          )
        }
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
