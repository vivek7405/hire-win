import Table from "app/core/components/Table"
import AuthLayout from "app/core/layouts/AuthLayout"
import {
  AuthorizationError,
  BlitzPage,
  ErrorComponent,
  GetServerSidePropsContext,
  getSession,
  InferGetServerSidePropsType,
  invalidateQuery,
  invokeWithMiddleware,
  useMutation,
  useQuery,
  useRouter,
} from "blitz"
import React, { Suspense, useEffect, useState } from "react"
import path from "path"
import Skeleton from "react-loading-skeleton"
import getConnectedCalendars from "../queries/getConnectedCalendars"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import Guard from "app/guard/ability"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import { ConnectedCalendar } from "db"
import AddCalendarForm from "../components/AddCalendarForm"
import Modal from "app/core/components/Modal"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import Form from "app/core/components/Form"
import getDefaultCalendarByUser from "../queries/getDefaultCalendarByUser"
import updateDefaultCalendar from "../mutations/updateDefaultCalendar"
import toast from "react-hot-toast"
import Card from "app/core/components/Card"
import { TrashIcon } from "@heroicons/react/outline"
import Debouncer from "app/core/utils/debouncer"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const { can: canUpdate } = await Guard.can(
    "update",
    "calendar",
    { session },
    { where: { ownerId: user?.id } }
  )

  if (user) {
    try {
      return {
        props: {
          user: user,
          canUpdate: canUpdate,
        },
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/login?next=/calendars`,
        permanent: false,
      },
      props: {},
    }
  }
}

type CalendarProps = {
  calendarEntries: ConnectedCalendar[]
}
const Calendars = ({ calendarEntries }: CalendarProps) => {
  // const columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //   },
  //   {
  //     Header: "Type",
  //     accessor: "type",
  //     Cell: (props) => {
  //       let val = props.value.includes("Caldav") ? "Caldav" : props.value
  //       val = val.includes("Google") ? "Google" : val
  //       val = val.includes("Outlook") ? "Outlook" : val
  //       return val
  //     },
  //   },
  //   {
  //     Header: "Status",
  //     accessor: "status",
  //   },
  // ]

  return (
    <>
      <br />
      {/* <br /> */}
      {/* <Table columns={columns} data={calendarEntries} noPagination={true} resultName="calendar" /> */}
      <div className="flex flex-wrap justify-center mt-2">
        {calendarEntries?.map((cal) => {
          let calType = cal.type.includes("Caldav") ? "Caldav" : cal.type
          calType = calType.includes("Google") ? "Google" : calType
          calType = calType.includes("Outlook") ? "Outlook" : calType

          return (
            <Card key={cal.id}>
              <div className="space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex md:justify-center lg:justify:center items-center">
                    {/* {cal.name} */}
                    <a className="cursor-pointer text-theme-600 hover:text-theme-800">{cal.name}</a>
                  </div>
                  {/* <div className="absolute top-0.5 right-0">
                    <button
                      id={"delete-" + cal.id}
                      className="float-right text-red-600 hover:text-red-800"
                      title="Remove Calendar"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        // submitDeletion(s.id)
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div> */}
                </div>
                <div className="border-b-2 border-gray-50 w-full"></div>
                <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                  {calType}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

const CalendarsHome = ({
  user,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [updateDefaultCalendarMutation] = useMutation(updateDefaultCalendar)
  const [showAddCalendarModal, setShowAddCalendarModal] = useState(false)
  const [query, setQuery] = useState({})
  const router = useRouter()

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

  const [filteredCalendarEntries] = useQuery(getConnectedCalendars, {
    where: {
      ownerId: user?.id,
      ...query,
    },
  })

  const [allCalendarEntries] = useQuery(getConnectedCalendars, {
    where: {
      ownerId: user?.id,
    },
  })

  const [defaultCalendar] = useQuery(getDefaultCalendarByUser, null)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

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

  return (
    <AuthLayout user={user}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Modal
          header="Add a new Schedule"
          open={showAddCalendarModal}
          setOpen={setShowAddCalendarModal}
        >
          <AddCalendarForm
            onClose={() => {
              setShowAddCalendarModal(false)
            }}
          />
        </Modal>

        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />

        <button
          className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
          onClick={() => {
            setShowAddCalendarModal(true)
          }}
        >
          New Calendar
        </button>

        <div className="float-right flex items-center">
          <span>Primary Calendar</span>
          <div className="w-40 ml-2 mr-10">
            <Form
              noFormatting={true}
              onSubmit={async () => {
                return
              }}
            >
              <LabeledReactSelectField
                name="primaryCalendar"
                options={allCalendarEntries?.map((calendar) => {
                  return { label: calendar?.name || "", value: calendar?.id?.toString() || "" }
                })}
                defaultValue={defaultCalendar?.calendarId?.toString()}
                onChange={async (value) => {
                  const selectedCalendarId: number = parseInt(value as any as string)
                  const selectedCalendarName = allCalendarEntries?.find(
                    (cal) => cal.id === selectedCalendarId
                  )?.name

                  const toastId = toast.loading(() => (
                    <span>
                      <b>
                        Setting primary calendar to
                        <br />
                        {'"'}
                        {selectedCalendarName}
                        {'"'}
                      </b>
                    </span>
                  ))
                  try {
                    await updateDefaultCalendarMutation(selectedCalendarId)
                    await invalidateQuery(getDefaultCalendarByUser)
                    toast.success(
                      () => (
                        <span>
                          <b>
                            Primary calendar changed to
                            <br />
                            {'"'}
                            {selectedCalendarName}
                            {'"'}
                          </b>
                        </span>
                      ),
                      { id: toastId }
                    )
                  } catch (error) {
                    toast.error(
                      "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                      { id: toastId }
                    )
                  }
                }}
              />
            </Form>
          </div>
        </div>

        <Calendars calendarEntries={filteredCalendarEntries as any} />
      </Suspense>
    </AuthLayout>
  )
}

CalendarsHome.authenticate = true
export default CalendarsHome
