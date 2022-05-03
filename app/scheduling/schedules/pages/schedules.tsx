import React, { Suspense, useEffect, useState } from "react"
import AuthLayout from "app/core/layouts/AuthLayout"
// import Card from "react-bootstrap/Card"
import {
  BlitzPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  invalidateQuery,
  Link,
  Routes,
  useMutation,
  useQuery,
  useRouter,
} from "blitz"
import AddScheduleModal from "../components/AddScheduleModal"
// import SectionHeader from "app/users/components/SectionHeader"
// import SectionFooter from "app/users/components/SectionFooter"
import Skeleton from "react-loading-skeleton"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import Debouncer from "app/core/utils/debouncer"
import deleteSchedule from "../mutations/deleteSchedule"
import getSchedulesWOPagination from "../queries/getSchedulesWOPagination"
import Modal from "app/core/components/Modal"
import Card from "app/core/components/Card"
import { TrashIcon } from "@heroicons/react/outline"
import Breadcrumbs from "app/core/components/Breadcrumbs"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const Schedules = ({ user }) => {
  // const [schedules] = useQuery(getSchedules, null)
  const [deleteScheduleMutation] = useMutation(deleteSchedule)
  const [activeSchedule, setActiveSchedule] = useState(0)
  const [message, setMessage] = useState("")
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedScheduleForDetails, setSelectedScheduleForDetails] = useState({} as any)
  const router = useRouter()
  const [query, setQuery] = useState({})

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
        page: 0,
        ...searchQuery,
      },
    })
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e) => {
    e.persist()
    return debouncer.execute(e)
  }

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            name: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

  // const [schedules] = useQuery(getSchedules, null)
  const [schedules] = useQuery(getSchedulesWOPagination, {
    where: {
      ownerId: user?.id,
      ...query,
    },
  })

  const submitDeletion = async (scheduleId: number) => {
    const result = await deleteScheduleMutation(scheduleId)
    if (result === "error") {
      setActiveSchedule(scheduleId)
      setMessage("There are still meetings with this schedule")
    } else {
      invalidateQuery(getSchedulesWOPagination)
    }
  }

  return (
    <>
      <Modal header="Schedule Details" open={detailsModalVisible} setOpen={setDetailsModalVisible}>
        <div key={selectedScheduleForDetails?.id} className="bg-white p-2">
          <b>{selectedScheduleForDetails?.name}</b>
          <br />
          <label>
            <b>Timezone:</b> {selectedScheduleForDetails.timezone}
          </label>
          <br />
          <br />
          {selectedScheduleForDetails?.dailySchedules?.map((dailySchedule) => {
            return (
              <div key={dailySchedule.day} className="mt-4">
                <b>{dailySchedule.day.charAt(0).toUpperCase() + dailySchedule.day.slice(1)}</b>
                <br />
                {dailySchedule.startTime === dailySchedule.endTime
                  ? "blocked"
                  : dailySchedule.startTime + " - " + dailySchedule.endTime}
              </div>
            )
          })}
        </div>
      </Modal>

      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      {schedules.map((s) => {
        return (
          <Card isFull={true} key={s.id}>
            <div className="space-y-2">
              <div className="w-full relative">
                <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                  <a
                    className="cursor-pointer text-theme-600 hover:text-theme-800"
                    onClick={() => {
                      setSelectedScheduleForDetails(s)
                      setDetailsModalVisible(true)
                    }}
                  >
                    {s.name}
                  </a>
                  {/* <Link href={Routes.SingleScoreCardPage({ slug: f.slug })} passHref>
                    <a
                      data-testid={`scoreCardlink`}
                      className="text-theme-600 hover:text-theme-800"
                    >
                      {f.name}
                    </a>
                  </Link> */}
                </div>
                <div className="absolute top-0.5 right-0">
                  {/* <Link href={Routes.ScoreCardSettingsPage({ slug: f.slug })} passHref>
                <a className="float-right text-theme-600 hover:text-theme-800">
                  <CogIcon className="h-6 w-6" />
                </a>
              </Link> */}
                  <button
                    id={"delete-" + s.name}
                    className="float-right text-red-600 hover:text-red-800"
                    title="Remove Schedule"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      submitDeletion(s.id)
                    }}
                  >
                    <TrashIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>
              <div className="border-b-2 border-gray-50 w-full"></div>
              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {/* {`${f.cardQuestions?.length} ${
                  f.cardQuestions?.length === 1 ? "Question" : "Questions"
                } · ${f.jobWorkflowStages?.length} ${
                  f.jobWorkflowStages?.length === 1 ? "Job" : "Jobs"
                }`} */}
                Timezone: {s.timezone}
              </div>
              <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                {s.dailySchedules?.map((ds) => {
                  return (
                    <div
                      key={ds.id}
                      className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                    >
                      <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                        {ds.day.charAt(0).toUpperCase() + ds.day.slice(1)}
                        <br />
                        {ds.startTime === ds.endTime
                          ? "blocked"
                          : ds.startTime + " - " + ds.endTime}
                      </div>
                      {/* <div className="text-neutral-600">
                        {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
                      </div> */}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )
      })}

      {/* <Schedules
        user={user}
        setSelectedScheduleForDetails={setSelectedScheduleForDetails}
        setDetailsModalVisible={setDetailsModalVisible}
      /> */}

      {/* {schedules.map((schedule) => {
        return (
          <div key={schedule.id}>
            <label>{schedule.name}</label>
            {schedule.dailySchedules.map((dailySchedule) => {
              return (
                <div key={dailySchedule.day}>
                  <b>{dailySchedule.day.charAt(0).toUpperCase() + dailySchedule.day.slice(1)}: </b>
                  <br />
                  {dailySchedule.startTime === dailySchedule.endTime
                    ? "blocked"
                    : dailySchedule.startTime + " - " + dailySchedule.endTime}
                </div>
              )
            })}
            <b>Timezone</b>
            <label>{schedule.timezone}</label>
            {activeSchedule === schedule.id && message !== "" && { message }}
            <button
              id={"delete-" + schedule.name}
              onClick={() => {
                submitDeletion(schedule.id)
              }}
            >
              Delete
            </button>
          </div>
        )
      })} */}

      {/* <Row>
        {schedules.map((schedule) => {
          return (
            <Col md={4} className="m-5" key={schedule.id}>
              <Card>
                <Card.Header className="text-center">{schedule.name}</Card.Header>
                <ListGroup variant="flush">
                  {schedule.dailySchedules.map((dailySchedule) => {
                    return (
                      <ListGroup.Item key={dailySchedule.day}>
                        <Row>
                          <Col sm={6}>
                            <b>
                              {dailySchedule.day.charAt(0).toUpperCase() +
                                dailySchedule.day.slice(1)}
                              :{" "}
                            </b>
                          </Col>
                          <Col sm={6}>
                            {dailySchedule.startTime === dailySchedule.endTime
                              ? "blocked"
                              : dailySchedule.startTime + " - " + dailySchedule.endTime}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    )
                  })}
                  <ListGroup.Item>
                    <Row>
                      <Col sm={6}>
                        <b>Timezone</b>
                      </Col>
                      <Col sm={6}>{schedule.timezone}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        {activeSchedule === schedule.id && message !== "" && (
                          <Alert variant="danger" className="mt-2">
                            {message}
                          </Alert>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        <Button
                          id={"delete-" + schedule.name}
                          variant="outline-danger"
                          onClick={() => {
                            submitDeletion(schedule.id)
                          }}
                        >
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          )
        })}
      </Row> */}
    </>
  )
}

const SchedulesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="SchedulesHome | hire-win" user={user}>
      {/* <Link href={Routes.NewStage()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Schedule
        </a>
      </Link> */}
      <div className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
        <AddScheduleModal />
      </div>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Schedules user={user} />
      </Suspense>
    </AuthLayout>
  )
}

SchedulesHome.authenticate = true

export default SchedulesHome
