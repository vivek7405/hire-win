import { TrashIcon } from "@heroicons/react/outline"
import Card from "app/core/components/Card"
import Confirm from "app/core/components/Confirm"
import Form from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import LabeledTextField from "app/core/components/LabeledTextField"
import Modal from "app/core/components/Modal"
import Debouncer from "app/core/utils/debouncer"
import { invalidateQuery, useMutation, useQuery, useRouter } from "blitz"
import { Calendar, User } from "db"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import deleteCalendar from "../mutations/deleteCalendar"
import updateDefaultCalendar from "../mutations/updateDefaultCalendar"
import getCalendars from "../queries/getCalendars"
import getDefaultCalendarByUser from "../queries/getDefaultCalendarByUser"
import AddCalendarForm from "./AddCalendarForm"
import { z } from "zod"
import updateCalendarName from "../mutations/updateCalendarName"

type CalendarProps = {
  user: User
}
const Calendars = ({ user }: CalendarProps) => {
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

  const [filteredCalendarEntries] = useQuery(getCalendars, {
    where: {
      ownerId: user?.id,
      ...query,
    },
  })

  const [allCalendarEntries] = useQuery(getCalendars, {
    where: {
      ownerId: user?.id,
    },
  })

  const [defaultCalendar] = useQuery(getDefaultCalendarByUser, null)
  const [deleteCalendarMutation] = useMutation(deleteCalendar)
  const [updateCalendarNameMutation] = useMutation(updateCalendarName)
  const [calendarToDelete, setCalendarToDelete] = useState(null as any as Calendar)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openNameUpdateModal, setOpenNameUpdateModal] = useState(false)
  const [calendarToUpdateName, setCalendarToUpdateName] = useState(null as any as Calendar | null)

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
    <>
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

      <Modal
        header="Add a new Schedule"
        open={openNameUpdateModal}
        setOpen={setOpenNameUpdateModal}
      >
        <Form
          header="Update Calendar Name"
          subHeader=""
          submitText="Submit"
          initialValues={{ name: calendarToUpdateName?.name || "" }}
          schema={z.object({ name: z.string().nonempty({ message: "Required" }) })}
          onSubmit={async (values) => {
            const toastId = toast.loading(`Updating Calendar Name to ${calendarToUpdateName?.name}`)
            try {
              await updateCalendarNameMutation({
                calendarId: calendarToUpdateName?.id || 0,
                calendarName: values.name || "",
              })
              toast.success("Calendar Name Updated", { id: toastId })
              await invalidateQuery(getCalendars)
            } catch (error) {
              toast.error(`Updating calendar name failed - ${error.toString()}`, { id: toastId })
            }
            setOpenNameUpdateModal(false)
          }}
        >
          <LabeledTextField name="name" />
        </Form>
      </Modal>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Calendar - ${calendarToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Calendar - ${calendarToDelete?.name}`)
          try {
            await deleteCalendarMutation(calendarToDelete?.id)
            toast.success("Calendar Deleted", { id: toastId })
            await invalidateQuery(getCalendars)
          } catch (error) {
            toast.error(`Deleting calendar failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
        }}
      >
        Are you sure you want to delete the calendar?
      </Confirm>

      <div className="hidden md:flex lg:flex items-center justify-between">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />

        <div className="flex items-center flex-nowrap">
          {filteredCalendarEntries?.length > 0 && (
            <div className="float-right flex items-center flex-nowrap">
              <span className="text-lg text-neutral-600">Default</span>
              <div className="w-40 ml-2 mr-5">
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
                          "Sorry, we had an unexpected error. Please try again. - " +
                            error.toString(),
                          { id: toastId }
                        )
                      }
                    }}
                  />
                </Form>
              </div>
            </div>
          )}

          <button
            className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 whitespace-nowrap"
            onClick={() => {
              setShowAddCalendarModal(true)
            }}
          >
            New Calendar
          </button>
        </div>
      </div>
      <br />
      {/* <br /> */}
      {/* <Table columns={columns} data={calendarEntries} noPagination={true} resultName="calendar" /> */}
      {filteredCalendarEntries?.length > 0 ? (
        <div className="flex flex-wrap justify-center mt-2">
          {filteredCalendarEntries?.map((cal) => {
            let calType = cal.type.includes("Caldav") ? "Caldav" : cal.type
            calType = calType.includes("Google") ? "Google" : calType
            calType = calType.includes("Outlook") ? "Outlook" : calType

            return (
              <Card key={cal.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="flex md:justify-center lg:justify:center items-center">
                      <button
                        onClick={() => {
                          setCalendarToUpdateName(cal as any)
                          setOpenNameUpdateModal(true)
                        }}
                        className="truncate"
                      >
                        <span className="cursor-pointer text-theme-600 font-bold hover:text-theme-800">
                          {cal.name}
                        </span>
                      </button>
                    </div>
                    <div className="absolute top-0.5 right-0">
                      <button
                        id={"delete-" + cal.id}
                        className="float-right text-red-600 hover:text-red-800"
                        title="Delete Calendar"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCalendarToDelete(cal as any)
                          setOpenConfirm(true)
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
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
      ) : (
        <div className="text-lg text-neutral-500 font-semibold">
          No Calendars found!
          <br />
          <br />
          Add one to start scheduling interviews.
        </div>
      )}
    </>
  )
}

export default Calendars
