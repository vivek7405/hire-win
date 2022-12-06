import { useRouter } from "next/router";
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { TrashIcon } from "@heroicons/react/outline"
import { DailySchedule, Schedule } from "@prisma/client"
import Card from "src/core/components/Card"
import Confirm from "src/core/components/Confirm"
import Modal from "src/core/components/Modal"
import Debouncer from "src/core/utils/debouncer"
import { initialSchedule } from "src/schedules/constants"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import addSchedule from "../mutations/addSchedule"
import deleteSchedule from "../mutations/deleteSchedule"
import getScheduleNames from "../queries/getScheduleNames"
import getSchedulesWOPagination from "../queries/getSchedulesWOPagination"
import {
  isScheduleWellFormed,
  scheduleDays,
  ScheduleInput,
  ScheduleInputType,
  SchedulesObj,
} from "../validations"
import AddScheduleForm from "./AddScheduleForm"
import AddScheduleModal from "./AddScheduleModal"
import { z } from "zod"
import updateSchedule from "../mutations/updateSchedule"
import Form from "src/core/components/Form"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import getDefaultScheduleByUser from "../queries/getDefaultScheduleByUser"
import updateDefaultSchedule from "../mutations/updateDefaultSchedule"

const Schedules = ({ user }) => {
  const [deleteScheduleMutation] = useMutation(deleteSchedule)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedScheduleForDetails, setSelectedScheduleForDetails] = useState({} as any)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState(null as any as Schedule)
  const router = useRouter()
  const [query, setQuery] = useState({})
  const [openAddSchedule, setOpenAddSchedule] = useState(false)
  const [addScheduleMutation] = useMutation(addSchedule)
  const [updateScheduleMutation] = useMutation(updateSchedule)
  const [defaultSchedule] = useQuery(getDefaultScheduleByUser, null)
  const [updateDefaultScheduleMutation] = useMutation(updateDefaultSchedule)

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

  const [schedules] = useQuery(getSchedulesWOPagination, {
    where: {
      userId: user?.id,
      ...query,
    },
  })

  const [scheduleToEdit, setScheduleToEdit] = useState(
    null as (Schedule & { dailySchedules: DailySchedule[] }) | null
  )

  const getFormDailyScheduleFromDBObj = (
    schedule: Schedule & { dailySchedules: DailySchedule[] }
  ) => {
    let dailySchedule = {}
    scheduleDays.forEach((day) => {
      const daySchedule = schedule?.dailySchedules?.find((sch) => sch.day === day)
      dailySchedule = {
        ...dailySchedule,
        [day]: {
          startTime: daySchedule?.startTime,
          endTime: daySchedule?.endTime,
          blocked: daySchedule?.startTime === daySchedule?.endTime,
        },
      }
    })
    return dailySchedule
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
                <b className="capitalize">{dailySchedule.day}</b>
                <br />
                {dailySchedule.startTime === dailySchedule.endTime
                  ? "Not available"
                  : dailySchedule.startTime + " - " + dailySchedule.endTime}
              </div>
            )
          })}
        </div>
      </Modal>

      <Modal
        header={`${scheduleToEdit ? "Edit" : "Add a new"} Availability`}
        open={openAddSchedule}
        setOpen={setOpenAddSchedule}
      >
        <AddScheduleForm
          header={`${scheduleToEdit ? "Edit" : "Add a new"} Availability`}
          // isDefaultEdit={scheduleToEdit?.name?.toLowerCase() === "default" ? true : false}
          subHeader=""
          initialValues={
            scheduleToEdit
              ? {
                  name: scheduleToEdit.name,
                  timezone: scheduleToEdit.timezone,
                  ...getFormDailyScheduleFromDBObj(scheduleToEdit),
                }
              : { name: "", ...initialSchedule }
          }
          onSubmit={async (values) => {
            const toastId = toast.loading(`${scheduleToEdit ? "Updating" : "Creating"} Schedule`)

            const name = values.name
            const timezone = values.timezone
            const schedule = (({
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            }) => ({
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            }))(values) as z.infer<typeof SchedulesObj>

            const inputObj = {
              name,
              timezone,
              schedule,
            } as ScheduleInputType

            if (!isScheduleWellFormed(schedule)) {
              toast.error(
                "Please check the entered times and its format of hour:minutes, e.g. 09:30",
                { id: toastId }
              )
              return
            }

            try {
              scheduleToEdit
                ? await updateScheduleMutation({ ...inputObj, id: scheduleToEdit.id })
                : await addScheduleMutation(inputObj)
              await invalidateQuery(getScheduleNames)
              await invalidateQuery(getSchedulesWOPagination)
              toast.success(`Schedule ${scheduleToEdit ? "updated" : "created"} successfully`, {
                id: toastId,
              })
            } catch (error) {
              toast.error(`Something went wrong - ${error.message}`, {
                id: toastId,
              })
            }

            setOpenAddSchedule(false)
          }}
        />
      </Modal>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Schedule - ${scheduleToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Schedule - ${scheduleToDelete?.name}`)
          try {
            await deleteScheduleMutation(scheduleToDelete?.id)
            toast.success("Schedule Deleted", { id: toastId })
            await invalidateQuery(getSchedulesWOPagination)
          } catch (error) {
            toast.error(`Deleting schedule failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
        }}
      >
        Are you sure you want to delete the schedule?
      </Confirm>

      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 flex-wrap items-center justify-between">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 w-full lg:mr-2 lg:w-1/4 px-2 py-2 rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />

        <div className="flex items-center flex-nowrap">
          {schedules?.length > 0 && (
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
                    name="defaultSchedule"
                    options={schedules?.map((schedule) => {
                      return { label: schedule?.name || "", value: schedule?.id?.toString() || "" }
                    })}
                    defaultValue={defaultSchedule?.scheduleId?.toString()}
                    onChange={async (value) => {
                      const selectedScheduleId: string = value as any
                      const selectedScheduleName = schedules?.find(
                        (sch) => sch.id === selectedScheduleId
                      )?.name

                      const toastId = toast.loading(() => (
                        <span>
                          <b>
                            Setting default schedule to
                            <br />
                            {'"'}
                            {selectedScheduleName}
                            {'"'}
                          </b>
                        </span>
                      ))
                      try {
                        await updateDefaultScheduleMutation(selectedScheduleId)
                        await invalidateQuery(getDefaultScheduleByUser)
                        toast.success(
                          () => (
                            <span>
                              <b>
                                Default Schedule changed to
                                <br />
                                {'"'}
                                {selectedScheduleName}
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
            onClick={(e) => {
              e.preventDefault()
              setScheduleToEdit(null)
              setOpenAddSchedule(true)
            }}
          >
            New Availability
          </button>
        </div>
      </div>

      {schedules.map((s) => {
        return (
          <Card isFull={true} key={s.id}>
            <div className="space-y-2">
              <div className="w-full relative">
                <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                  <a
                    className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 md:px-6 lg:px-6 truncate"
                    onClick={() => {
                      setScheduleToEdit(s)
                      setOpenAddSchedule(true)
                    }}
                  >
                    {s.name}
                  </a>
                </div>
                <div className="absolute top-0.5 right-0">
                  <button
                    id={"delete-" + s.name}
                    className="float-right text-red-600 hover:text-red-800"
                    title="Delete Schedule"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setScheduleToDelete(s)
                      setOpenConfirm(true)
                    }}
                  >
                    <TrashIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>
              <div className="border-b-2 border-gray-50 w-full"></div>
              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                Timezone: {s.timezone}
              </div>
              <div className="hidden lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                {s.dailySchedules?.map((ds) => {
                  return (
                    <div
                      key={ds.id}
                      className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                    >
                      <div className="capitalize overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                        {ds.day}
                        <br />
                        {ds.startTime === ds.endTime
                          ? "Not available"
                          : ds.startTime + " - " + ds.endTime}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )
      })}
    </>
  )
}

export default Schedules
