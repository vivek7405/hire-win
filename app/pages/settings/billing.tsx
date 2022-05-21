import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  Routes,
  useMutation,
  useSession,
  getSession,
  invokeWithMiddleware,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "app/users/components/UserForm"
import SecurityForm from "app/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "app/users/mutations/updateUser"
import changePassword from "app/auth/mutations/changePassword"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "app/core/utils/themeHelpers"
import UserSettingsLayout from "app/core/layouts/UserSettingsLayout"
import SubscribeButton from "app/users/components/SubscribeButton"
import { Plan } from "types"
import { CheckIcon } from "@heroicons/react/outline"
import createStripeBillingPortal from "app/users/mutations/createStripeBillingPortal"
import { checkPlan } from "app/users/utils/checkPlan"
import { plans } from "app/core/utils/plans"
import getCompany from "app/companies/queries/getCompany"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const company = await invokeWithMiddleware(
    getCompany,
    { where: { id: session.companyId || 0 } },
    { ...context }
  )

  if (user && company) {
    return {
      props: {
        plans,
        user,
        company,
        currentPlan: checkPlan(company) as Plan | null,
      },
    }
  } else {
    return {
      redirect: {
        destination: "/login?next=settings/billing",
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsBillingPage = ({
  plans,
  user,
  currentPlan,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)
  const session = useSession()

  return (
    <AuthLayout title="Settings" user={user}>
      <UserSettingsLayout>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="sm:overflow-hidden">
            <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
              {/* <div className="mb-6">
                <h2
                  id="billing-history-heading"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  Plans
                </h2>
              </div> */}

              {currentPlan ? (
                <div className="my-5">
                  <h3 className="text-xl font-bold">
                    You are subscribed to the {currentPlan?.title}
                  </h3>
                  <br />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Manage subscription
                  </h3>
                  <div className="mt-2 md:flex md:items-start md:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                      <p>
                        View your past invoices, cancel your subscription , or update your card.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:ml-6 md:shrink-0 md:flex md:items-center">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-sm text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 sm:text-sm"
                        onClick={async (e) => {
                          e.preventDefault()
                          try {
                            const url = await createStripeBillingPortalMutation({
                              companyId: session.companyId || 0,
                            })

                            if (url) window.location.href = url
                          } catch (err) {
                            toast.error("Unable to open Manage Billing")
                          }
                        }}
                      >
                        Manage billing
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:grid md:gap-6 md:grid-flow-row md:grid-cols-3">
                  {plans?.map((plan, i) => {
                    return (
                      <div key={i} className="mt-12 md:mt-0 space-y-12 lg:space-y-0 flex flex-col">
                        <div className="flex-1 pb-6">
                          <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                          <p className="mt-4 flex items-baseline text-gray-900">
                            <span className="text-5xl text-theme-500 font-extrabold tracking-tight">
                              ${plan.price}
                            </span>
                            <span className="ml-1 text-sm text-gray-400">{plan.frequency}</span>
                          </p>
                          {/* <p className="mt-6 text-gray-800">{plan.description}</p> */}
                          <ul className="mt-6 space-y-6">
                            {plan.features.map((feature, j) => (
                              <li key={j} className="flex">
                                <span className="text-gray-500">- {feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <SubscribeButton
                          priceId={plan.priceId}
                          userId={user?.id as number}
                          quantity={1}
                          type="new"
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* If user is subscribed, show other plans to upgrade/downgrade */}
              {currentPlan && (
                <div className="md:grid md:gap-6 md:grid-flow-row md:grid-cols-3">
                  {plans?.map((plan, i) => {
                    if (plan !== currentPlan) {
                      return (
                        <div
                          key={i}
                          className="mt-12 md:mt-0 space-y-12 lg:space-y-0 flex flex-col"
                        >
                          <div className="flex-1 pb-6">
                            <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                              <span className="text-5xl font-extrabold tracking-tight">
                                ${plan.price}
                              </span>
                              <span className="ml-1 text-xl font-semibold">{plan.frequency}</span>
                            </p>
                            {/* <p className="mt-6 text-gray-500">{plan.description}</p> */}
                            <ul className="mt-6 space-y-6">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex">
                                  <CheckIcon
                                    className="shrink-0 w-6 h-6 text-theme-500"
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 text-gray-500">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <SubscribeButton
                            priceId={plan.priceId}
                            userId={user?.id as number}
                            quantity={1}
                            type="update"
                          />
                        </div>
                      )
                    } else {
                      return null
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </UserSettingsLayout>
    </AuthLayout>
  )
}

UserSettingsBillingPage.suppressFirstRenderFlicker = true

export default UserSettingsBillingPage
