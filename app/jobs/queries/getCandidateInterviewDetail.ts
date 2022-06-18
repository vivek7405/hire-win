import db, { Calendar, DailySchedule, Schedule, User } from "db"
import { InterviewDetailType } from "types"

type getCandidateInterviewerInput = {
  workflowStageId: string
  candidateId: string
  jobId: string
}

export default async function getCandidateInterviewDetail({
  workflowStageId,
  candidateId,
  jobId,
}: getCandidateInterviewerInput) {
  // If interviewer is assigned for individual candidate, return interviewer
  const candidateWorkflowStageInterviewer = await db.candidateWorkflowStageInterviewer.findUnique({
    where: {
      candidateId_workflowStageId: {
        candidateId,
        workflowStageId,
      },
    },
    include: {
      interviewer: {
        include: {
          calendars: true,
          schedules: { include: { dailySchedules: true } },
          defaultCalendars: { include: { calendar: true } },
        },
      },
    },
  })
  if (candidateWorkflowStageInterviewer) {
    const interviewer = candidateWorkflowStageInterviewer?.interviewer
    const defaultCalendar = interviewer?.defaultCalendars?.find(
      (def) => def.userId === interviewer?.id
    )?.calendar
    const interviewDetail = await db.interviewDetail.findUnique({
      where: {
        jobId_workflowStageId: {
          jobId,
          workflowStageId,
        },
      },
    })

    return {
      interviewer: interviewer,
      calendar: interviewer?.calendars?.find((cal) => cal.id === defaultCalendar?.id),
      schedule: interviewer?.schedules?.find((sch) => sch.factory === true),
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }

  // If interviewer is assigned for job workflowStage, return interviewer
  const workflowStage = await db.workflowStage.findFirst({
    where: { id: workflowStageId },
    include: {
      interviewDetails: {
        include: {
          interviewer: {
            include: {
              calendars: true,
              schedules: { include: { dailySchedules: true } },
              defaultCalendars: { include: { calendar: true } },
            },
          },
          schedule: { include: { dailySchedules: true } },
          calendar: true,
        },
      },
    },
  })
  if (workflowStage) {
    const interviewDetail = workflowStage.interviewDetails?.find((int) => int.jobId === jobId)

    return {
      interviewer: interviewDetail?.interviewer,
      calendar: interviewDetail?.calendar,
      schedule: interviewDetail?.schedule,
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }

  // If no interviewer assignment found, return the job owner as interviewer
  const jobUsers = await db.jobUser.findMany({
    where: { jobId },
    include: {
      user: {
        include: {
          calendars: true,
          schedules: { include: { dailySchedules: true } },
          defaultCalendars: { include: { calendar: true } },
        },
      },
    },
  })
  if (jobUsers) {
    const interviewer = jobUsers?.find((user) => user?.role === "OWNER")?.user
    const defaultCalendar = interviewer?.defaultCalendars?.find(
      (def) => def.userId === interviewer?.id
    )?.calendar
    const interviewDetail = await db.interviewDetail.findUnique({
      where: {
        jobId_workflowStageId: {
          jobId,
          workflowStageId,
        },
      },
    })

    return {
      interviewer: interviewer,
      calendar: interviewer?.calendars?.find((cal) => cal.id === defaultCalendar?.id),
      schedule: interviewer?.schedules?.find((sch) => sch.factory === true),
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }

  return null
}
