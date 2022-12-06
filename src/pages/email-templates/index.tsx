import { gSSP } from "src/blitz-server";
import Link from "next/link";
import { useSession } from "@blitzjs/auth";
import { useRouter } from "next/router";
import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Card from "src/core/components/Card"
import Modal from "src/core/components/Modal"
import AuthLayout from "src/core/layouts/AuthLayout"
import Debouncer from "src/core/utils/debouncer"
import EmailTemplateForm from "src/email-templates/components/EmailTemplateForm"
import createEmailTemplate from "src/email-templates/mutations/createEmailTemplate"
import getEmailTemplatesWOPagination from "src/email-templates/queries/getEmailTemplatesWOPagination"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import { Suspense, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import { TrashIcon } from "@heroicons/react/outline"
import { EmailTemplate } from "@prisma/client"
import Confirm from "src/core/components/Confirm"
import deleteEmailTemplate from "src/email-templates/mutations/deleteEmailTemplate"
import updateEmailTemplate from "src/email-templates/mutations/updateEmailTemplate"
import getEmailTemplates from "src/email-templates/queries/getEmailTemplates"
import Pagination from "src/core/components/Pagination"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
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
        destination: `/auth/login?next=/email-templates`,
        permanent: false,
      },
      props: {},
    }
  }
})

const EmailTemplates = () => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const session = useSession()
  const [query, setQuery] = useState({})
  const [emailTemplateToDelete, setEmailTemplateToDelete] = useState(null as EmailTemplate | null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [createEmailTemplateMutation] = useMutation(createEmailTemplate)
  const [updateEmailTemplateMutation] = useMutation(updateEmailTemplate)
  const [deleteEmailTemplateMutation] = useMutation(deleteEmailTemplate)
  const [emailTemplateToEdit, setEmailTemplateToEdit] = useState(null as any as EmailTemplate)

  const [{ emailTemplates, hasMore, count }] = usePaginatedQuery(getEmailTemplates, {
    where: { ...query, companyId: session.companyId || "0" },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  if (endPage > count) {
    endPage = count
  }

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
        header={`Delete Email Template - ${emailTemplateToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Email Template`)
          try {
            if (!emailTemplateToDelete) {
              throw new Error("No email template set to delete")
            }
            await deleteEmailTemplateMutation(emailTemplateToDelete.id)
            toast.success("Email Template Deleted", { id: toastId })
            invalidateQuery(getEmailTemplates)
          } catch (error) {
            toast.error(`Deleting email template failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setEmailTemplateToDelete(null)
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

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="email template"
      />

      {emailTemplates?.length > 0 && (
        <div className="flex flex-wrap justify-center max-w-md mx-auto">
          {emailTemplates.map((et) => {
            return (
              <Card isFull={true} key={et.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex items-center">
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 truncate"
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
                  <div className="text-neutral-500 font-semibold flex">
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
      <div className="mb-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Email Templates</h2>
        <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
          Add email templates to send an email to candidates with one-click
        </h4>
      </div>

      <Suspense fallback="Loading...">
        <EmailTemplates />
      </Suspense>
    </AuthLayout>
  )
}

EmailTemplatesHome.authenticate = true

export default EmailTemplatesHome
