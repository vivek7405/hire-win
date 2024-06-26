import { gSSP } from "src/blitz-server"
import { useSession, getSession } from "@blitzjs/auth"
import { useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { useRouter } from "next/router"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "src/users/components/UserForm"
import SecurityForm from "src/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "src/users/mutations/updateUser"
import changePassword from "src/auth/mutations/changePassword"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "src/core/utils/themeHelpers"
import UserSettingsLayout from "src/core/layouts/UserSettingsLayout"
import SubscribeButton from "src/users/components/SubscribeButton"
import { Currency, Plan, PlanFrequency, PlanName, SubscriptionStatus } from "types"
import { CheckIcon, CurrencyEuroIcon } from "@heroicons/react/outline"
import createStripeBillingPortal from "src/companies/mutations/createStripeBillingPortal"
import { checkPlan } from "src/companies/utils/checkPlan"
// import { plans } from "src/core/utils/plans"
import getCompany from "src/companies/queries/getCompany"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { CompanyUserRole } from "db"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import LocaleCurrency from "locale-currency"
import Form from "src/core/components/Form"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import { Suspense, useEffect, useState } from "react"
import getAllPlans from "src/plans/queries/getAllPlans"
import proPlanFeatures from "src/plans/utils/proPlanFeatures"
import { data } from "cheerio/lib/api/attributes"
import getUserSubscription from "src/companies/queries/getUserSubscription"
import moment from "moment"
import RecruiterSubscribedWelcome from "src/coupons/components/RecruiterSubscribedWelcome"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const company = await getCompany({ where: { id: session.companyId || "0" } }, { ...context.ctx })
  const companyUser = await getCompanyUser(
    { where: { userId: session.userId || "0", companyId: session.companyId || "0" } },
    { ...context.ctx }
  )

  const subscription = await getUserSubscription({ userId: user?.id || "0" }, { ...context.ctx })

  if (user && company) {
    return {
      props: {
        // plans,
        user,
        company,
        subscription,
        companyUser,
      },
    }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=/settings/billing",
        permanent: false,
      },
      props: {},
    }
  }
})

const Plans = ({ user }) => {
  const [plans] = useQuery(getAllPlans, {})

  return (
    <>
      <div className="flex flex-col md:flex-row lg:flex-row space-y-10 md:space-y-0 lg:space-y-0 md:space-x-10 lg:space-x-10">
        {plans?.map((plan, i) => {
          return (
            <div key={i} className="flex flex-col md:mt-0 space-y-3 lg:space-y-0">
              <div className="flex-1 pb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl text-theme-500 font-extrabold tracking-tight whitespace-nowrap">
                    {plan.currencySymbol}
                    {plan.pricePerMonth}
                  </span>
                  <span className="ml-1 text-lg text-gray-400">/month</span>
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Rounded off to your local currency if available
                </p>
                {user?.referredByAffiliate && !user?.stripeCustomerId && (
                  <div className="mt-5 text-sm font-bold text-neutral-600">
                    <p className="text-2xl text-theme-500 font-extrabold tracking-tight">
                      -10% referral discount for 1 Year
                    </p>
                    <p>Since you have been referred by {user?.referredByAffiliate?.name},</p>
                    <p>you shall get a 10% referral discount for 1 Year!</p>
                  </div>
                )}
                {/* {plan.frequency === PlanFrequency.YEARLY && (
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-xl text-theme-500 font-extrabold tracking-tight whitespace-nowrap">
                      {plan.currencySymbol}
                      {plan.pricePerYear}
                    </span>
                    <span className="ml-1 text-lg text-gray-400">/year</span>
                  </p>
                )} */}
                {/* <p className="mt-6 text-gray-800">{plan.description}</p> */}
                {/* <ul className="mt-6 space-y-4">
                                {plan.features.map((feature, j) => (
                                  <li key={j} className="flex">
                                    <span className="text-gray-500">- {feature}</span>
                                  </li>
                                ))}
                              </ul> */}
              </div>
              <Suspense fallback="Loading...">
                <SubscribeButton
                  priceId={plan.priceId}
                  frequency={plan.frequency}
                  userId={user?.id!}
                  quantity={1}
                  type="new"
                />
              </Suspense>
            </div>
          )
        })}
      </div>
      <ul className="mt-10 space-y-6 text-xl">
        {proPlanFeatures.map((feature, j) => (
          <li key={j} className="flex">
            <span className="text-gray-500">- {feature}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

const UserSettingsBillingPage = ({
  // plans,
  user,
  subscription,
  companyUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const router = useRouter()
  const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)

  // used useEffect for setting couponRedeemed to avoid Hydration error
  const [recruiterSubscribed, setRecruiterSubscribed] = useState(false)
  useEffect(() => {
    setRecruiterSubscribed(router.query.recruiterSubscribed ? true : false)
  }, [])

  return (
    <>
      {companyUser?.role === CompanyUserRole.OWNER ? (
        <AuthLayout title="Hire.win | Billing" user={user}>
          <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
          <Suspense fallback="Loading...">
            <UserSettingsLayout>
              <Suspense fallback="Loading...">
                {recruiterSubscribed && (
                  <RecruiterSubscribedWelcome
                    setRecruiterSubscribed={setRecruiterSubscribed}
                    userName={user?.name || ""}
                    userId={user?.id}
                  />
                )}
                <div className="bg-white md:col-span-2">
                  <div className="sm:overflow-hidden">
                    <div className="px-4 py-5 md:p-0 md:flex md:flex-col">
                      {/* {!(
                      subscription?.status === SubscriptionStatus.ACTIVE ||
                      subscription?.status === SubscriptionStatus.TRIALING
                    ) && (
                      <>
                        <Form noFormatting={true} onSubmit={async (values) => {}}>
                          <LabeledToggleGroupField
                            name="currency"
                            paddingX={3}
                            paddingY={1}
                            value={selectedCurrency}
                            options={Object.keys(Currency).map((currency) => {
                              return { label: currency, value: currency }
                            })}
                            onChange={async (value) => {
                              setSelectedCurrency(value)
                            }}
                          />
                        </Form>
                        <br />
                      </>
                    )}
                    <div className="mb-6">
                      <h2
                        id="billing-history-heading"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        Plans
                      </h2>
                    </div> */}

                      {subscription?.status === SubscriptionStatus.ACTIVE ||
                      subscription?.status === SubscriptionStatus.TRIALING ? (
                        <div className="my-5">
                          <h3 className="text-xl font-bold">
                            {subscription?.status === SubscriptionStatus.TRIALING &&
                            subscription?.trial_end ? (
                              <span>
                                Your free trial ends{" "}
                                {moment.unix(subscription?.trial_end)?.local()?.fromNow()}
                              </span>
                            ) : (
                              <span>
                                You are subscribed to the{" "}
                                {/* <span className="capitalize">{`${subscription?.items?.data[0]?.price?.recurring?.interval}ly`}</span>{" "} */}
                                Recruiter Plan 🚀
                              </span>
                            )}
                          </h3>
                          <br />
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Manage subscription
                          </h3>
                          <div className="mt-2 md:flex md:items-start md:justify-between">
                            <div className="max-w-xl text-sm text-gray-500">
                              <p>
                                View your past invoices, cancel your subscription, or update your
                                card.
                              </p>
                            </div>
                            <div className="mt-5 md:mt-0 md:ml-6 md:shrink-0 md:flex md:items-center">
                              <button
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-sm text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 sm:text-sm"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  try {
                                    const url = await createStripeBillingPortalMutation({
                                      userId: session.userId || "0",
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
                        <>
                          {/* <Form noFormatting={true} onSubmit={async (values) => {}}>
                          <LabeledToggleGroupField
                            name="currency"
                            paddingX={3}
                            paddingY={1}
                            value={selectedCurrency}
                            options={Object.keys(Currency).map((currency) => {
                              return { label: currency, value: currency }
                            })}
                            onChange={async (value) => {
                              setSelectedCurrency(value)
                            }}
                          />
                        </Form>
                        <br /> */}
                          <Suspense fallback="Loading...">
                            <Plans user={user} />
                          </Suspense>
                        </>
                      )}

                      {/* If user is subscribed, show other plans to upgrade/downgrade */}
                      {/* {currentPlan && (
                    <div className="md:grid md:gap-6 md:grid-flow-row md:grid-cols-3">
                      {plans?.map((plan, i) => {
                        if (plan !== currentPlan) {
                          return (
                            <div
                              key={i}
                              className="mt-12 md:mt-0 space-y-12 lg:space-y-0 flex flex-col"
                            >
                              <div className="flex-1 pb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {plan.title}
                                </h3>
                                <p className="mt-4 flex items-baseline text-gray-900">
                                  <span className="text-5xl font-extrabold tracking-tight whitespace-nowrap">
                                    {plan.currencySymbol}
                                    {plan.price}
                                  </span>
                                  <span className="ml-1 text-xl font-semibold">
                                    {plan.frequency}
                                  </span>
                                </p>
                                <p className="mt-6 text-gray-500">{plan.description}</p>
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
                                userId={user?.id!}
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
                  )} */}
                    </div>
                  </div>
                </div>
              </Suspense>
            </UserSettingsLayout>
          </Suspense>
        </AuthLayout>
      ) : (
        <ErrorComponent statusCode={401} title="You are not authorized to access this page" />
      )}
    </>
  )
}

UserSettingsBillingPage.suppressFirstRenderFlicker = true

export default UserSettingsBillingPage
