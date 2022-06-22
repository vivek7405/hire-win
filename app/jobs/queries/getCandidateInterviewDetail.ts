import db, { Calendar, DailySchedule, Schedule, User } from "db"
import { InterviewDetailType } from "types"

type GetInterviewDetailsInputType = {
  workflowStageId: string
  candidateId: string
  jobId: string
}

export default async function getCandidateInterviewDetail(
  interviewDetailsInput: GetInterviewDetailsInputType
) {
  // if candidate specific interviewer is assigned
  const candidateSpecificInterviewDetails = await getCandidateSpecificInterviewDetails(
    interviewDetailsInput
  )

  // job stage interview details as per job settings
  const jobStageInterviewDetails = await getJobStageInterviewDetails(interviewDetailsInput)

  if (candidateSpecificInterviewDetails) {
    // If both candidate specific and job stage interviewer are same, use the job stage interviewing details
    if (jobStageInterviewDetails) {
      if (
        candidateSpecificInterviewDetails?.interviewer?.id ===
        jobStageInterviewDetails?.interviewer?.id
      ) {
        return jobStageInterviewDetails
      }
    }

    return candidateSpecificInterviewDetails
  }

  if (jobStageInterviewDetails) {
    return jobStageInterviewDetails
  }

  // If no interviewer assignment found
  const jobOwnerInterviewDetails = await getJobOwnerInterviewDetails(interviewDetailsInput)
  if (jobOwnerInterviewDetails) {
    return jobOwnerInterviewDetails
  }

  return null
}

const getCandidateSpecificInterviewDetails = async ({
  workflowStageId,
  candidateId,
  jobId,
}: GetInterviewDetailsInputType) => {
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
      workflowStage: {
        include: {
          jobUserScheduleCalendars: {
            include: {
              schedule: { include: { dailySchedules: true } },
              calendar: true,
            },
          },
        },
      },
    },
  })
  if (candidateWorkflowStageInterviewer) {
    const interviewer = candidateWorkflowStageInterviewer?.interviewer
    const defaultCalendarId = interviewer?.defaultCalendars?.find(
      (def) => def.userId === interviewer?.id
    )?.calendar?.id
    const defaultScheduleId = interviewer?.schedules?.find((sch) => sch.factory === true)?.id
    const scheduleCalendar =
      candidateWorkflowStageInterviewer?.workflowStage?.jobUserScheduleCalendars?.find(
        (schCal) => schCal.jobId === jobId && schCal.userId === interviewer?.id
      )
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
      calendar: interviewer?.calendars?.find(
        (cal) => cal.id === (scheduleCalendar?.calendarId || defaultCalendarId)
      ),
      schedule: interviewer?.schedules?.find(
        (sch) => sch.id === (scheduleCalendar?.scheduleId || defaultScheduleId)
      ),
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }

  return null
}

const getJobStageInterviewDetails = async ({
  workflowStageId,
  candidateId,
  jobId,
}: GetInterviewDetailsInputType) => {
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
        },
      },
      jobUserScheduleCalendars: {
        include: {
          schedule: { include: { dailySchedules: true } },
          calendar: true,
        },
      },
    },
  })
  if (workflowStage) {
    const interviewDetail = workflowStage.interviewDetails?.find((int) => int.jobId === jobId)
    const scheduleCalendar = workflowStage.jobUserScheduleCalendars?.find(
      (int) => int.jobId === jobId && int.userId === interviewDetail?.interviewerId
    )

    return {
      interviewer: interviewDetail?.interviewer,
      calendar: scheduleCalendar?.calendar,
      schedule: scheduleCalendar?.schedule,
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }

  return null
}

const getJobOwnerInterviewDetails = async ({
  workflowStageId,
  candidateId,
  jobId,
}: GetInterviewDetailsInputType) => {
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
    const defaultCalendarId = interviewer?.defaultCalendars?.find(
      (def) => def.userId === interviewer?.id
    )?.calendar?.id
    const defaultScheduleId = interviewer?.schedules?.find((sch) => sch.factory === true)?.id
    const scheduleCalendar = await db.jobUserScheduleCalendar.findUnique({
      where: {
        jobId_workflowStageId_userId: {
          jobId,
          workflowStageId,
          userId: interviewer?.id || 0,
        },
      },
      include: {
        schedule: { include: { dailySchedules: true } },
        calendar: true,
      },
    })
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
      calendar: interviewer?.calendars?.find(
        (cal) => cal.id === (scheduleCalendar?.calendarId || defaultCalendarId)
      ),
      schedule: interviewer?.schedules?.find(
        (sch) => sch.id === (scheduleCalendar?.scheduleId || defaultScheduleId)
      ),
      duration: interviewDetail?.duration || 30,
    } as InterviewDetailType
  }
}
