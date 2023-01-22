import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { ClipboardCopyIcon } from "@heroicons/react/outline"
import { Affiliate } from "@prisma/client"
import moment from "moment"
import { Suspense, useState } from "react"
import toast from "react-hot-toast"
import createAffiliate from "src/affiliates/mutations/createAffiliate"
import updateAffiliate from "src/affiliates/mutations/updateAffiliate"
import getAffiliate from "src/affiliates/queries/getAffiliate"
import getEarnings from "src/affiliates/queries/getEarnings"
import { AffiliateObj } from "src/affiliates/validations"
import Form from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import LandingLayout from "src/core/layouts/LandingLayout"
import { z } from "zod"

type TotalEarningsTillNowParamsType = {
  affiliate: Affiliate
}
function TotalEarningsTillNow({ affiliate }: TotalEarningsTillNowParamsType) {
  const [totalEarnings] = useQuery(getEarnings, {
    affiliateId: affiliate?.id || "0",
    invoiceIdsNotToCalculate: [],
    invoiceIdsToCalculate: null,
  })

  return <>{totalEarnings}</>
}

type DueAmountParamsType = {
  affiliate: Affiliate
}
function DueAmount({ affiliate }: DueAmountParamsType) {
  const [dueAmount] = useQuery(getEarnings, {
    affiliateId: affiliate?.id || "0",
    invoiceIdsNotToCalculate: affiliate?.invoiceIdsPaid,
    invoiceIdsToCalculate: null,
  })

  return <>{dueAmount}</>
}

type PaidAmountParamsType = {
  affiliate: Affiliate
}
function PaidAmount({ affiliate }: PaidAmountParamsType) {
  const [paidAmount] = useQuery(getEarnings, {
    affiliateId: affiliate?.id || "0",
    invoiceIdsNotToCalculate: [],
    invoiceIdsToCalculate: affiliate?.invoiceIdsPaid,
  })

  return <>{paidAmount}</>
}

export default function Refer() {
  const [email, setEmail] = useState(null as string | null)
  const [affiliate] = useQuery(getAffiliate, { where: { email: email ?? "0" } })
  const [createAffiliateMutation] = useMutation(createAffiliate)
  const [updateAffiliateMutation] = useMutation(updateAffiliate)

  const baseURL =
    process.env.NODE_ENV === "production" ? "https://hire.win" : "http://localhost:3000"
  const encodedBaseURL =
    process.env.NODE_ENV === "production" ? "https%3A%2F%2Fhire.win" : "http%3A%2F%2Flocalhost:3000"

  return (
    <LandingLayout title="Hire.win | Refer & Earn">
      <section className="px-4">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="w-full my-2 text-4xl lg:text-5xl font-black text-center text-neutral-800">
            Refer and Earn
          </h2>
          <div className="w-full mb-4">
            <div className="h-1 mx-auto bg-gradient-to-r from-neutral-400 to-neutral-700 w-40 lg:w-64 opacity-25 my-0 py-0 rounded-t"></div>
          </div>
        </div>

        <div className="sm:mx-10 mt-10 p-10 bg-white rounded-lg">
          <h2 className="text-center font-bold sm:text-xl">
            Earn 50% Monthly Recurring Commission!
          </h2>

          <h2 className="text-center sm:text-lg">Refered customers get 10% OFF for 1 Year!</h2>

          <h6 className="mt-5 text-center">
            When you refer a customer using your referral link, and if they subscribe to our paid
            plan, they get 10% OFF for 1 year and you get 50% lifetime monthly commission until they
            stay subscribed!
          </h6>

          {!affiliate ? (
            <>
              <h6 className="mt-10 font-bold text-center">
                Start/Track your referral journey now:
              </h6>
              <div className="flex items-center justify-center mt-3">
                <Form
                  noFormatting={true}
                  schema={AffiliateObj}
                  onSubmit={async (values) => {
                    const toastId = toast.loading("Loading...")
                    try {
                      let createdOrExistingAffiliate = null as Affiliate | null
                      if (values?.email) {
                        createdOrExistingAffiliate = await createAffiliateMutation({
                          email: values.email,
                        })
                        setEmail(values.email)
                      }
                      toast.success(
                        createdOrExistingAffiliate?.name
                          ? "Affiliate details fetched"
                          : "Affiliate Created",
                        { id: toastId }
                      )
                    } catch (error) {
                      toast.error("Something went wrong", { id: toastId })
                    }
                  }}
                >
                  <div className="flex space-x-1 items-center justify-center">
                    <LabeledTextField name="email" type="email" placeholder="Enter your email" />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-theme-600 hover:bg-theme-700 text-white rounded"
                    >
                      Go
                    </button>
                  </div>
                </Form>
              </div>
            </>
          ) : (
            <div className="mt-10">
              {affiliate?.name ? (
                <>
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 border-2 border-neutral-400 rounded-lg">
                      <p className="text-center font-bold">
                        {affiliate?.name}, here's your Referral Link:
                      </p>

                      <div className="mt-1 flex items-center justify-center space-x-3">
                        <p className="text-center text-neutral-700 italic">
                          {baseURL}?via={affiliate?.id}
                        </p>
                        <span
                          title="Copy"
                          className="cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(`${baseURL}?via=${affiliate?.id}`)
                            toast.success("Referral link copied")
                          }}
                        >
                          <ClipboardCopyIcon className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-center space-x-3">
                        <a
                          target="_blank"
                          rel="external"
                          href={`https://twitter.com/intent/tweet?text=I%20recently%20setup%20my%20careers%20page%20and%20started%20scheduling%20all%20my%20interviews%20through%20%40hire_win.%0A%0AIt%27s%20a%20simple%2C%20easy%20tool%20that%20makes%20it%20so%20much%20easier%20to%20list%20a%20job%20and%20conduct%20interviews.%0A%0AI%20invite%20you%20to%20try%20it%20out%20with%20my%20referral%20link%20below%3A%0A${encodedBaseURL}%3Fvia%3D${affiliate?.id}`}
                        >
                          <img
                            className="w-5 h-5"
                            alt="Twitter: hire_win"
                            src="https://ci4.googleusercontent.com/proxy/1HZ9PYNP6V1RqnUt65SPfooXxlj2enHeWMeK7LEqRUuiUegvuol0VpNCL6o42KGG_Ngjh1s14MA9e6renGFMArwX=s0-d-e1-ft#https://sendfox.com/img/social-icon-twitter.png"
                          />
                        </a>

                        <a
                          target="_blank"
                          rel="external"
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedBaseURL}%3Fvia%3D${affiliate?.id}`}
                        >
                          <img
                            className="w-5 h-5"
                            alt="LinkedIn: hirewin"
                            src="https://ci6.googleusercontent.com/proxy/MhGelWQXLYi7x4PBl53oivvCGPJrSnska4YJI_riOt3EkuaHG28YMP40Cm1vcZzDRWrlOWHX_ExpdMpCsinUjufyyg=s0-d-e1-ft#https://sendfox.com/img/social-icon-linkedin.png"
                          />
                        </a>

                        <a
                          target="_blank"
                          rel="external"
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedBaseURL}%3Fvia%3D${affiliate?.id}`}
                        >
                          <img
                            className="w-5 h-5"
                            alt="Facebook: hirewin"
                            src="https://ci4.googleusercontent.com/proxy/OLjWmhzfHJJ7BHuo7tEbcg0AuA5auq9uDzd5pZ6pGNzugoW8gxDF5IemvmM5E9MM3jotztSj4UnoXQwHzHw-Lf3r0Q=s0-d-e1-ft#https://sendfox.com/img/social-icon-facebook.png"
                          />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    {affiliate?.referredUsers?.length > 0 ? (
                      <>
                        <p className="text-center font-medium">
                          Below are the users you have referred:
                        </p>
                        <div className="overflow-auto">
                          <table className="mt-3 table min-w-full border border-gray-200">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Signup Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Active Subscription?
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Current Subscription End Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {affiliate?.referredUsers?.map((referredUser) => {
                                return (
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                                      {referredUser?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                                      {referredUser?.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                                      {referredUser?.createdAt?.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                                      {referredUser?.stripeSubscriptionId &&
                                      moment(referredUser?.stripeCurrentPeriodEnd)
                                        .local()
                                        .toDate()
                                        .getTime() > Date.now()
                                        ? "Yes"
                                        : "No"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                                      {referredUser?.stripeCurrentPeriodEnd?.toLocaleDateString() ||
                                        "NA"}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-5 flex flex-col items-center justify-center">
                          <p className="font-bold">
                            Total Earnings till now:{" "}
                            <Suspense fallback="Loading...">
                              ₹<TotalEarningsTillNow affiliate={affiliate} />
                            </Suspense>
                          </p>
                          <p className="font-bold mt-2">
                            Amount already Paid:{" "}
                            <Suspense fallback="Loading...">
                              ₹<PaidAmount affiliate={affiliate} />
                            </Suspense>
                          </p>
                          <p className="font-bold mt-2">
                            Amount Due:{" "}
                            <Suspense fallback="Loading...">
                              ₹<DueAmount affiliate={affiliate} />
                            </Suspense>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-center">
                          You have no referrals yet, share your referral link with potential
                          customers and ask them to signup. Once they signup, you will see their
                          details here...
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Form
                    noFormatting={true}
                    schema={z.object({
                      name: z.string().nonempty({ message: "Required" }),
                    })}
                    onSubmit={async (values) => {
                      const toastId = toast.loading("Loading...")
                      try {
                        if (values?.name && email) {
                          await updateAffiliateMutation({
                            where: { email },
                            data: { name: values.name },
                          })
                          await invalidateQuery(getAffiliate)
                        }
                        toast.success("Affiliate details updated", { id: toastId })
                      } catch (error) {
                        toast.error("Something went wrong", { id: toastId })
                      }
                    }}
                  >
                    <div className="flex space-x-1 items-center justify-center">
                      <LabeledTextField name="name" placeholder="Enter your name" />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-theme-600 hover:bg-theme-700 text-white rounded"
                      >
                        Submit
                      </button>
                    </div>
                  </Form>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
