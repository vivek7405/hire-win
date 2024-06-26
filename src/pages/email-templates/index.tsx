import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import { ErrorComponent, Routes } from "@blitzjs/next"
import { invalidateQuery, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
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
import { LibraryIcon, TrashIcon } from "@heroicons/react/outline"
import { CompanyUserRole, EmailTemplate, ParentCompanyUserRole } from "@prisma/client"
import Confirm from "src/core/components/Confirm"
import deleteEmailTemplate from "src/email-templates/mutations/deleteEmailTemplate"
import updateEmailTemplate from "src/email-templates/mutations/updateEmailTemplate"
import getEmailTemplates from "src/email-templates/queries/getEmailTemplates"
import Pagination from "src/core/components/Pagination"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { PlanName } from "types"
import UpgradeMessage from "src/plans/components/UpgradeMessage"
import { PencilIcon } from "@heroicons/react/solid"
import classNames from "src/core/utils/classNames"
import getParentCompany from "src/parent-companies/queries/getParentCompany"
import getCompany from "src/companies/queries/getCompany"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"
import getCompanyUser from "src/companies/queries/getCompanyUser"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    const company = await getCompany(
      {
        where: { id: context?.ctx?.session?.companyId || "0" },
      },
      context.ctx
    )

    const companyUser = await getCompanyUser(
      {
        where: {
          companyId: company?.id || "0",
          userId: user?.id || "0",
        },
      },
      context.ctx
    )

    const parentCompany = await getParentCompany(
      {
        where: { id: company?.parentCompanyId || "0" },
      },
      context.ctx
    )

    const parentCompanyUser = await getParentCompanyUser(
      {
        where: {
          parentCompanyId: parentCompany?.id || "0",
          userId: context?.ctx?.session?.userId || "0",
        },
      },
      context.ctx
    )

    const isCompanyOwnerOrAdmin =
      (companyUser && companyUser?.role !== CompanyUserRole.USER) || false

    const isParentCompanyOwnerOrAdmin =
      (parentCompany?.name &&
        parentCompanyUser &&
        parentCompanyUser?.role !== ParentCompanyUserRole.USER) ||
      false

    if (!isCompanyOwnerOrAdmin && !isParentCompanyOwnerOrAdmin) {
      return {
        props: {
          error: {
            statusCode: 403,
            message: "You don't have permission",
          },
        },
      } as any
    }

    return {
      props: {
        isCompanyOwnerOrAdmin,
        isParentCompanyOwnerOrAdmin,
        user,
        activePlanName,
        companyUser,
        parentCompany,
        parentCompanyUser,
      },
    }
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

const EmailTemplates = ({
  isCompanyOwnerOrAdmin,
  isParentCompanyOwnerOrAdmin,
  user,
  error,
  activePlanName,
  companyUser,
  parentCompany,
  parentCompanyUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
  const [emailTemplateToEdit, setEmailTemplateToEdit] = useState(null as EmailTemplate | null)
  const [openUpgradeConfirm, setOpenUpgradeConfirm] = useState(false)

  const [viewParent, setViewParent] = useState(isParentCompanyOwnerOrAdmin)

  const [{ emailTemplates, hasMore, count }] = usePaginatedQuery(getEmailTemplates, {
    where: {
      ...query,
      companyId: isParentCompanyOwnerOrAdmin && viewParent ? null : session.companyId || "0",
      parentCompanyId: isParentCompanyOwnerOrAdmin && viewParent ? parentCompany?.id || "0" : null,
    },
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

      <Confirm
        open={openUpgradeConfirm}
        setOpen={setOpenUpgradeConfirm}
        header="Upgrade to recruiter plan"
        cancelText="Ok"
        hideConfirm={true}
        onSuccess={async () => {
          setOpenUpgradeConfirm(false)
        }}
      >
        Upgrade to recruiter plan for adding/editing email templates.
      </Confirm>

      <Modal header="Add New Template" open={openModal} setOpen={setOpenModal}>
        <EmailTemplateForm
          header="New Email Template"
          subHeader={viewParent ? "Parent Company Email Template" : "Company Email Template"}
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
            if (activePlanName === PlanName.FREE) {
              setEmailTemplateToEdit(null)
              setOpenModal(false)
              setOpenUpgradeConfirm(true)
              return
            }

            const isEdit = emailTemplateToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating template" : "Adding template")
            try {
              if (values?.body) {
                values.body = convertToRaw(values?.body?.getCurrentContent())
              }

              if (isParentCompanyOwnerOrAdmin && viewParent) {
                values["parentCompanyId"] = parentCompany?.id || "0"
              }

              if (isEdit) {
                if (emailTemplateToEdit) {
                  await updateEmailTemplateMutation({
                    where: { id: emailTemplateToEdit?.id },
                    data: { ...values },
                    initial: emailTemplateToEdit,
                  })
                } else {
                  toast.error("No email template is set for editing", { id: toastId })
                  return
                }
              } else {
                await createEmailTemplateMutation({ ...values })
              }
              await invalidateQuery(getEmailTemplates)
              toast.success(
                isEdit ? "Template updated successfully" : "Template added successfully",
                { id: toastId }
              )
              setEmailTemplateToEdit(null)
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
          className="float-right text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700 whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault()
            setEmailTemplateToEdit(null)
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

      {isCompanyOwnerOrAdmin && isParentCompanyOwnerOrAdmin && (
        <div className="flex items-center justify-center mt-5">
          <button
            // className="px-4 py-1 border rounded-lg bg-white hover:bg-neutral-500 hover:text-white"
            className={classNames(
              "px-4 py-1 border border-neutral-300 rounded-lg",
              viewParent
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "text-neutral-600 bg-white hover:bg-neutral-500 hover:text-white"
            )}
            onClick={(e) => {
              e.preventDefault()
              setViewParent(!viewParent)
            }}
          >
            {/* {viewRejected ? "Viewing Rejected" : "View Rejected"} */}
            <span className="flex items-center justify-center space-x-2">
              <LibraryIcon className="w-5 h-5" />
              <span>
                {viewParent
                  ? "Viewing Parent Company Email Templates"
                  : "View Parent Company Email Templates"}
              </span>
            </span>
          </button>
        </div>
      )}

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName={viewParent ? "parent company email template" : "company email template"}
      />

      {emailTemplates?.length > 0 && (
        <div className="flex flex-wrap justify-center max-w-md mx-auto">
          {emailTemplates.map((et) => {
            return (
              <Card isFull={true} key={et.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex items-center">
                      {/* <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 truncate"
                        onClick={(e) => {
                          e.preventDefault()
                          setEmailTemplateToEdit(et)
                          setOpenModal(true)
                        }}
                      > */}
                      <div className="pr-12 text-neutral-700 truncate">{et.name}</div>
                      {/* </a> */}
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
                    <div className="absolute top-0.5 right-6">
                      <button
                        id={"edit-" + et.id}
                        className="float-right text-indigo-600 hover:text-indigo-800"
                        title="Edit Candidate Pool"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setEmailTemplateToEdit(et)
                          setOpenModal(true)
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
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

const EmailTemplatesHome = ({
  isCompanyOwnerOrAdmin,
  isParentCompanyOwnerOrAdmin,
  user,
  error,
  activePlanName,
  companyUser,
  parentCompany,
  parentCompanyUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Email Templates" user={user}>
      <div className="mb-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Email Templates</h2>
        <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
          Add email templates to send an email to candidates with one-click
        </h4>
        {activePlanName === PlanName.FREE && (
          <div className="mt-2 w-full md:w-2/3 lg:w-3/5 xl:w-1/2">
            <UpgradeMessage message="Upgrade to add more Email Templates" />
          </div>
        )}
      </div>

      <Suspense fallback="Loading...">
        <EmailTemplates
          isCompanyOwnerOrAdmin={isCompanyOwnerOrAdmin}
          isParentCompanyOwnerOrAdmin={isParentCompanyOwnerOrAdmin}
          user={user}
          activePlanName={activePlanName}
          companyUser={companyUser}
          parentCompany={parentCompany}
          parentCompanyUser={parentCompanyUser}
        />
      </Suspense>
    </AuthLayout>
  )
}

EmailTemplatesHome.authenticate = true

export default EmailTemplatesHome
