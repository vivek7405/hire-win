import React, { Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useMutation,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useQuery,
  invalidateQuery,
} from "blitz"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Modal from "app/core/components/Modal"
import Guard from "app/guard/ability"

import Breadcrumbs from "app/core/components/Breadcrumbs"

import Confirm from "app/core/components/Confirm"
import generateInviteToJobToken from "app/jobs/mutations/generateInviteToJobToken"
import getTokens from "app/jobs/queries/getTokens"
import deleteToken from "app/jobs/mutations/deleteToken"

import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"
import { XCircleIcon } from "@heroicons/react/outline"
import toast from "react-hot-toast"

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
    "job",
    { session },
    {
      where: {
        companyId_slug: {
          companyId: session.companyId || "0",
          slug: context?.params?.slug as string,
        },
      },
    }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const job = await invokeWithMiddleware(
          getJob,
          {
            where: { slug: context?.params?.slug as string },
          },
          { ...context }
        )

        return {
          props: {
            user: user,
            job: job,
            canUpdate,
            isOwner,
          },
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        }
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
        destination: `/login?next=/jobs/${context?.params?.slug}/settings/keys`,
        permanent: false,
      },
      props: {},
    }
  }
}

const KeyTable = ({ job, canUpdate }) => {
  const [deleteTokenMutation] = useMutation(deleteToken)
  const [tokens] = useQuery(getTokens, {
    where: {
      jobId: job?.id,
    },
  })

  const [openConfirm, setOpenConfirm] = React.useState(false)

  return (
    <>
      <div className="flex flex-col overflow-auto rounded-sm">
        <h2 className="text-gray-500">Public Key</h2>
        <table className="table min-w-full border border-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Issued At
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens
              .filter((t) => t.type === "PUBLIC_KEY")
              .map((t, i) => {
                return (
                  <tr className="bg-white" key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      {t.hashedToken}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      {new Date(t.createdAt).toString()}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col overflow-auto rounded-sm mt-6">
        <h2 className="text-gray-500">Private Keys</h2>
        <table className="table min-w-full border border-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Issued At
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens
              .filter((t) => t.type === "SECRET_KEY")
              .map((t, i) => {
                return (
                  <tr className="bg-white" key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      <span className="text-gray-400 mr-1">****</span>
                      {t.lastFour}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      {new Date(t.createdAt).toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                      {canUpdate && (
                        <>
                          <Confirm
                            open={openConfirm}
                            setOpen={setOpenConfirm}
                            header={"Delete Key?"}
                            onSuccess={async () => {
                              const toastId = toast.loading(() => <span>Removing Key</span>)
                              try {
                                await deleteTokenMutation({
                                  where: {
                                    id: t.id,
                                  },
                                })
                                toast.success(() => <span>Key deleted</span>, {
                                  id: toastId,
                                })
                              } catch (error) {
                                toast.error(
                                  "Sorry, we had an unexpected error. Please try again. - " +
                                    error.toString(),
                                  { id: toastId }
                                )
                              }
                              invalidateQuery(getTokens)
                              setOpenConfirm(false)
                            }}
                          >
                            Are you sure you want to remove the key ending with <b>{t.lastFour}</b>{" "}
                            from the job?
                          </Confirm>

                          <button
                            data-testid={`remove-token-${t.id}-fromJob`}
                            className="bg-red-500 rounded-full"
                            onClick={async (e) => {
                              e.preventDefault()
                              setOpenConfirm(true)
                            }}
                          >
                            <XCircleIcon className="w-auto h-6 text-red-100" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </>
  )
}

const JobSettingsKeysPage = ({
  user,
  job,
  error,
  canUpdate,
  isOwner,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [generateInviteToJobTokenMutation] = useMutation(generateInviteToJobToken)
  const [newSecret, setNewSecret] = React.useState("")
  const [modalOpen, setModalOpen] = React.useState(false)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={job!}>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="sm:overflow-hidden">
            <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2
                  id="billing-history-heading"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  API Keys
                </h2>
                <Modal header="Your Secret Token" open={modalOpen} setOpen={setModalOpen}>
                  <div className="bg-white p-6">
                    <h2>This is your secret key. You will only be shown this key once.</h2>
                    <input
                      disabled
                      value={newSecret}
                      className="border disabled border-gray-300 mt-2 px-2 py-2 block w-full sm:text-sm rounded"
                    />
                  </div>
                </Modal>
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    const token = await generateInviteToJobTokenMutation({
                      jobId: job?.id as string,
                    })
                    setNewSecret(token as string)
                    invalidateQuery(getTokens)
                    setModalOpen(true)
                  }}
                  data-testid={`open-secretToken-modal`}
                  className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
                >
                  Generate New Keys
                </button>
              </div>

              <Suspense fallback="Loading...">
                <KeyTable job={job} canUpdate={canUpdate} />
              </Suspense>
            </div>
          </div>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsKeysPage
