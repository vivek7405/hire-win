import Card from "app/core/components/Card"
import Modal from "app/core/components/Modal"
import AuthLayout from "app/core/layouts/AuthLayout"
import Debouncer from "app/core/utils/debouncer"
import EmailTemplateForm from "app/email-templates/components/EmailTemplateForm"
import createEmailTemplate from "app/email-templates/mutations/createEmailTemplate"
import getEmailTemplates from "app/email-templates/queries/getEmailTemplates"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  invalidateQuery,
  Link,
  Routes,
  useMutation,
  useQuery,
  useRouter,
  useSession,
} from "blitz"
import path from "path"
import { Suspense, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import { TrashIcon } from "@heroicons/react/outline"
import { EmailTemplate } from "@prisma/client"
import Confirm from "app/core/components/Confirm"
import deleteEmailTemplate from "app/email-templates/mutations/deleteEmailTemplate"
import updateEmailTemplate from "app/email-templates/mutations/updateEmailTemplate"

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
        destination: `/login?next=/email-templates`,
        permanent: false,
      },
      props: {},
    }
  }
}

const EmailTemplates = ({ user }) => {
  const router = useRouter()
  const session = useSession()
  const [query, setQuery] = useState({})
  const [emailTemplateToDelete, setEmailTemplateToDelete] = useState(null as any as EmailTemplate)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [createEmailTemplateMutation] = useMutation(createEmailTemplate)
  const [updateEmailTemplateMutation] = useMutation(updateEmailTemplate)
  const [emailTemplates] = useQuery(getEmailTemplates, {
    where: { ...query, companyId: session.companyId || 0 },
  })
  const [deleteEmailTemplateMutation] = useMutation(deleteEmailTemplate)
  const [emailTemplateToEdit, setEmailTemplateToEdit] = useState(null as any as EmailTemplate)

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            subject: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

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
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Email Template - ${emailTemplateToDelete?.subject}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Email Template`)
          try {
            await deleteEmailTemplateMutation(emailTemplateToDelete?.id)
            toast.success("Email Template Deleted", { id: toastId })
            invalidateQuery(getEmailTemplates)
          } catch (error) {
            toast.error(`Deleting email template failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setEmailTemplateToDelete(null as any)
        }}
      >
        Are you sure you want to delete the email template?
      </Confirm>

      <Modal header="Add New Template" open={openModal} setOpen={setOpenModal}>
        <EmailTemplateForm
          header="New Email Template"
          subHeader="HTML Template"
          initialValues={
            emailTemplateToEdit
              ? {
                  name: emailTemplateToEdit.name,
                  subject: emailTemplateToEdit.subject,
                  body: EditorState.createWithContent(
                    convertFromRaw(emailTemplateToEdit?.body || {})
                  ),
                }
              : { body: EditorState.createEmpty() }
          }
          onSubmit={async (values) => {
            const isEdit = emailTemplateToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating template" : "Adding template")
            try {
              if (values?.body) {
                values.body = convertToRaw(values?.body?.getCurrentContent())
              }

              isEdit
                ? await updateEmailTemplateMutation({
                    where: { id: emailTemplateToEdit.id },
                    data: { ...values },
                    initial: emailTemplateToEdit,
                  })
                : await createEmailTemplateMutation({ ...values })
              await invalidateQuery(getEmailTemplates)
              toast.success(
                isEdit ? "Template updated successfully" : "Template added successfully",
                { id: toastId }
              )
              setEmailTemplateToEdit(null as any)
              setOpenModal(false)
            } catch (error) {
              toast.error(
                `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                { id: toastId }
              )
            }
          }}
        />
      </Modal>

      <div>
        <button
          className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault()
            setEmailTemplateToEdit(null as any)
            setOpenModal(true)
          }}
        >
          New Email Template
        </button>
      </div>
      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 md:w-1/4 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      {emailTemplates?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No templates found.</div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {emailTemplates.map((et) => {
            return (
              <Card key={et.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 truncate"
                        onClick={(e) => {
                          e.preventDefault()
                          setEmailTemplateToEdit(et)
                          setOpenModal(true)
                        }}
                      >
                        {et.name}
                      </a>
                    </div>
                    <div className="absolute top-0.5 right-0">
                      <button
                        id={"delete-" + et.id}
                        className="float-right text-red-600 hover:text-red-800"
                        title="Delete Email Template"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setEmailTemplateToDelete(et)
                          setOpenConfirm(true)
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {et._count?.emails} {et._count?.emails === 1 ? "Email" : "Emails"}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

const EmailTemplatesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Email Templates | hire-win" user={user}>
      <Suspense fallback="Loading...">
        <EmailTemplates user={user} />
      </Suspense>
    </AuthLayout>
  )
}

EmailTemplatesHome.authenticate = true

export default EmailTemplatesHome
