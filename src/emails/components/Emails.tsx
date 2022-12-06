import { useSession } from "@blitzjs/auth";
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/outline"
import { Candidate, Email, EmailTemplate, JobUser, User } from "@prisma/client"
import Confirm from "src/core/components/Confirm"
import Modal from "src/core/components/Modal"
import moment from "moment"
import { useState } from "react"
import toast from "react-hot-toast"
import deleteEmail from "../mutations/deleteEmail"
import getCandidateEmailsByStage from "../queries/getCandidateEmailsByStage"
import EmailForm from "./EmailForm"
import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import getEmails from "../queries/getEmails"
import sendEmail from "../mutations/sendEmail"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import getEmailTemplatesWOPagination from "src/email-templates/queries/getEmailTemplatesWOPagination"
import { EmailTemplatePlaceholders } from "types"
import { JsonValue } from "aws-sdk/clients/glue"
import getCandidateInterviewer from "src/candidates/queries/getCandidateInterviewer"
import getStage from "src/stages/queries/getStage"
import getCandidate from "src/candidates/queries/getCandidate"

interface ETValues {
  [key: string]: string
}

const Emails = ({ user, stageId, candidate }) => {
  const session = useSession()
  const [openModal, setOpenModal] = useState(false)
  const [deleteEmailMutation] = useMutation(deleteEmail)
  const [emailToDelete, setEmailToDelete] = useState(null as any as Email)
  const [emailToView, setEmailToView] = useState(null as any as Email)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [candidateStageEmails] = useQuery(getCandidateEmailsByStage, {
    candidateId: candidate?.id || "0",
    stageId,
  })
  // const [stage] = useQuery(getStage, { where: { id: stageId || "0" } })

  const [sendEmailMutation] = useMutation(sendEmail)
  const [emailTemplatesOpen, setEmailTemplatesOpen] = useState(false)
  const [emailTemplates] = useQuery(getEmailTemplatesWOPagination, {
    where: { companyId: session.companyId || "0" },
  })
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState(null as any as EmailTemplate)
  // const interviewDetailId =
  //   selectedWorkflowStage?.interviewDetails?.find((int) => int.jobId === candidate?.jobId)?.id ||
  //   "0"
  // const [interviewDetail] = useQuery(getInterviewDetail, { interviewDetailId })
  const [interviewer] = useQuery(getCandidateInterviewer, {
    candidateId: candidate?.id || "0",
    stageId: stageId || "0",
  })

  const replaceEmailTemplatePlaceHolders = (body: JSON) => {
    if (body) {
      let stringifiedBody = JSON.stringify(body)

      let etValues: ETValues = {}
      Object.keys(EmailTemplatePlaceholders)?.map((etPlaceholder) => {
        switch (etPlaceholder) {
          case EmailTemplatePlaceholders.Candidate_Name:
            etValues[etPlaceholder] = candidate?.name
            break
          case EmailTemplatePlaceholders.Company_Name:
            etValues[etPlaceholder] = user?.companies?.find(
              (cu) => cu.company?.id === session?.companyId
            )?.company?.name
            break
          case EmailTemplatePlaceholders.Interviewer_Name:
            etValues[etPlaceholder] = interviewer?.name || ""
            break
          case EmailTemplatePlaceholders.Job_Title:
            etValues[etPlaceholder] = candidate?.job?.title
            break
          case EmailTemplatePlaceholders.Job_Stage:
            etValues[etPlaceholder] = candidate?.workflowStage?.stage?.name
            break
          case EmailTemplatePlaceholders.Sender_Name:
            etValues[etPlaceholder] = user?.name
            break
        }
      })

      Object.keys(EmailTemplatePlaceholders)?.map((etPlaceholder) => {
        stringifiedBody = stringifiedBody?.replaceAll(
          `{{${etPlaceholder}}}`,
          etValues[etPlaceholder] || ""
        )
      })

      return JSON.parse(stringifiedBody)
    }
    return {}
  }

  return (
    <>
      <Modal noOverflow={true} header="Send Email" open={openModal} setOpen={setOpenModal}>
        <EmailForm
          disabled={emailToView ? true : false}
          header={`${emailToView ? "" : "Send "}Email to ${candidate?.name}`}
          subHeader=""
          initialValues={
            selectedEmailTemplate
              ? {
                  subject: selectedEmailTemplate.subject,
                  body: EditorState.createWithContent(
                    convertFromRaw(
                      replaceEmailTemplatePlaceHolders(selectedEmailTemplate?.body as any) || {}
                    )
                  ),
                }
              : emailToView
              ? {
                  subject: emailToView.subject,
                  cc: emailToView.cc,
                  body: EditorState.createWithContent(convertFromRaw(emailToView?.body || {})),
                }
              : { subject: "", body: EditorState.createEmpty() }
          }
          onSubmit={async (values) => {
            const toastId = toast.loading("Sending email")
            try {
              if (values?.body) {
                values.body = convertToRaw(values?.body?.getCurrentContent())
              }

              // values.body = draftToHtml(values.body || {})

              await sendEmailMutation({
                ...values,
                templateId: selectedEmailTemplate?.id,
                candidateId: candidate?.id,
                stageId,
              })
              invalidateQuery(getCandidateEmailsByStage)
              invalidateQuery(getCandidate)
              setEmailToView(null as any)
              setSelectedEmailTemplate(null as any)
              toast.success("Email sent successfully", { id: toastId })
              setOpenModal(false)
            } catch (error) {
              toast.error(`Failed to send email - ${error.toString()}`, { id: toastId })
            }
          }}
        />
      </Modal>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Delete Email Entry"
        onSuccess={async () => {
          const toastId = toast.loading("Deleting email entry")
          try {
            await deleteEmailMutation(emailToDelete?.id || "0")
            toast.success("Email entry deleted", { id: toastId })
            setOpenConfirm(false)
            invalidateQuery(getCandidateEmailsByStage)
            invalidateQuery(getCandidate)
          } catch (error) {
            toast.error(`Deletion failed - ${error.toString()}`, {
              id: toastId,
            })
          }
        }}
      >
        Are you sure you want to delete the email entry?
      </Confirm>

      <div className="m-6">
        <div className="flex items-center">
          <div className="font-bold text-lg w-full">Emails</div>
          {/* <button
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-end text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
            disabled={
              selectedWorkflowStage?.interviewDetails?.find(
                (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
              )?.interviewerId !== user?.id &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)
                ?.role !== "OWNER" &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)
                ?.role !== "ADMIN"
            }
            onClick={() => {
              setOpenModal(true)
            }}
          >
            Send
          </button> */}
          <div className="float-right cursor-pointer flex justify-center">
            <button
              className="disabled:opacity-50 disabled:cursor-not-allowed text-white bg-theme-600 px-3 py-2 ml-6 hover:bg-theme-700 rounded-l-sm"
              disabled={
                // selectedWorkflowStage?.interviewDetails?.find(
                //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                // )?.interviewerId !== user?.id &&
                interviewer?.id !== user?.id &&
                user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                  "OWNER" &&
                user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !== "ADMIN"
              }
              onClick={() => {
                setSelectedEmailTemplate(null as any)
                setEmailToView(null as any)
                setOpenModal(true)
              }}
            >
              New
            </button>
            {/* <button className="text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center">
              <ChevronDownIcon className="w-5 h-5" />
            </button> */}
            <DropdownMenu.Root
              modal={false}
              open={emailTemplatesOpen}
              onOpenChange={setEmailTemplatesOpen}
            >
              <DropdownMenu.Trigger
                className="disabled:opacity-50 disabled:cursor-not-allowed text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center focus:outline-none"
                disabled={
                  // selectedWorkflowStage?.interviewDetails?.find(
                  //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                  // )?.interviewerId !== user?.id &&
                  interviewer?.id !== user?.id &&
                  user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                    "OWNER" &&
                  user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                    "ADMIN"
                }
              >
                {/* <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                  {user?.email.charAt(0).toUpperCase()}
                </div> */}
                <button
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    // selectedWorkflowStage?.interviewDetails?.find(
                    //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                    // )?.interviewerId !== user?.id &&
                    interviewer?.id !== user?.id &&
                    user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                      "OWNER" &&
                    user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                      "ADMIN"
                  }
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
                <DropdownMenu.Arrow className="fill-current" offset={10} />
                {emailTemplates.map((et) => {
                  return (
                    <DropdownMenu.Item
                      key={et.id}
                      onSelect={(e) => {
                        e.preventDefault()
                        setSelectedEmailTemplate(et)
                        setEmailToView(null as any)
                        setOpenModal(true)
                      }}
                      className="text-left w-auto max-w-xs truncate whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:text-gray-900"
                    >
                      {et.name}
                    </DropdownMenu.Item>
                  )
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
        <div className="w-full mt-3 flex flex-col space-y-3">
          {candidateStageEmails?.length === 0 && <p>No emails sent</p>}
          {candidateStageEmails.map((email, index) => {
            return (
              <>
                <CandidateEmail
                  key={email.id}
                  email={email}
                  user={user as any}
                  setOpenConfirm={setOpenConfirm}
                  setEmailToDelete={setEmailToDelete}
                  setEmailToView={setEmailToView}
                  setOpenModal={setOpenModal}
                />
              </>
            )
          })}
        </div>
      </div>
    </>
  )
}

type CandidateEmailProps = {
  email: Email & { candidate: Candidate } & { sender: User } & {
    templateUsed: EmailTemplate | null
  }
  user: User & { jobUsers: JobUser[] }
  setOpenConfirm: any
  setEmailToDelete: any
  setEmailToView: any
  setOpenModal: any
}
const CandidateEmail = ({
  email,
  user,
  setOpenConfirm,
  setEmailToDelete,
  setEmailToView,
  setOpenModal,
}: CandidateEmailProps) => {
  return (
    <div key={email.id} className="w-full p-3 bg-neutral-50 border-2 rounded">
      <button
        className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={
          user?.id !== email?.senderId &&
          user?.jobUsers?.find((jobUser) => jobUser.jobId === email?.candidate?.jobId)?.role !==
            "OWNER"
        }
        onClick={() => {
          setOpenConfirm(true)
          setEmailToDelete(email)
        }}
      >
        <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
      </button>
      <b className="capitalize">{moment(email.createdAt).local().fromNow()}</b>
      <br />
      {moment(email.createdAt).toLocaleString()}
      <br />
      Subject:{" "}
      <a
        className="text-theme-500 hover:text-theme-700 cursor-pointer underline"
        onClick={() => {
          setEmailToView(email)
          setOpenModal(true)
        }}
      >
        {email?.subject}
      </a>
      <br />
      Sender: {email?.senderId === user?.id ? "You" : email?.sender?.name}
      <br />
      CC: {email.cc || "NA"}
      <br />
      Template Used: {email?.templateUsed?.name || "NA"}
    </div>
  )
}

export default Emails
