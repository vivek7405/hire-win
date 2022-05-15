// import { getEmailService } from "app/email"
import { Queue } from "quirrel/blitz"
import db, { Interview } from "db"
import { sendInterviewReminderMailer } from "mailers/sendInterviewReminderMailer"

function asTwoDigit(n: number): string {
  const s = n.toString()
  if (s.length === 1) {
    return "0" + s
  }

  return s
}

export default Queue("api/queues/reminders", async (interviewId: Interview["id"]) => {
  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      interviewDetail: { include: { interviewer: true } },
      candidate: { select: { email: true } },
    },
  })
  if (!interview) {
    return
  }

  const buildEmail = await sendInterviewReminderMailer({
    to: interview?.candidate?.email,
    interview,
  })
  await buildEmail.send()
})
