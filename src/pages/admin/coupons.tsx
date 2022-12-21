import { gSSP } from "src/blitz-server"
import getUser from "src/users/queries/getUser"
import path from "path"
import AuthLayout from "src/core/layouts/AuthLayout"
import AdminLayout from "src/core/layouts/AdminLayout"
import { InferGetServerSidePropsType } from "next"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import createCoupons from "src/coupons/mutations/createCoupons"
import { useState } from "react"
import toast from "react-hot-toast"
import getCoupons from "src/coupons/queries/getCoupons"
import { CouponGeneratedFor } from "@prisma/client"
import { titleCase } from "src/core/utils/titleCase"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getUser(
    { where: { id: context.ctx?.session?.userId || "0" } },
    { ...context.ctx }
  )

  if (user && user.role === "ADMIN") {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
})

const AdminCouponsPage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [createCouponsMutation] = useMutation(createCoupons)

  const [unRedeemedCoupons] = useQuery(getCoupons, { where: { redemptionDate: null } })
  const [redeemedCoupons] = useQuery(getCoupons, { where: { redemptionDate: { not: null } } })

  const [numberOfCouponsToCreate, setNumberOfCouponsToCreateQuantity] = useState(10)
  const [licenseTier, setLicenseTier] = useState(1)

  const [generatedFor, setGeneratedFor] = useState(CouponGeneratedFor.SELF)

  return (
    <AuthLayout title={`Hire.win | Admin Coupons`} user={user}>
      <AdminLayout>
        <div className="w-fit p-5 rounded border border-theme-600">
          <div>Coupons Available: {unRedeemedCoupons.length}</div>
          <div>Coupons Used: {redeemedCoupons.length}</div>
        </div>

        <br />
        <label htmlFor="coupons-quantity">Enter number of coupons you want to generate</label>
        <input
          id="coupons-quantity"
          className="ml-2 rounded border border-theme-600 px-4 py-1 w-28"
          type="number"
          value={numberOfCouponsToCreate}
          onChange={(e) => {
            setNumberOfCouponsToCreateQuantity(parseInt(e?.target?.value || "100"))
          }}
        />

        <br />
        <label htmlFor="license-tier">Enter the license tier for coupons</label>
        <input
          id="license-tier"
          className="ml-2 rounded border border-theme-600 px-4 py-1 w-28"
          type="number"
          value={licenseTier}
          onChange={(e) => {
            setLicenseTier(parseInt(e?.target?.value || "1"))
          }}
        />

        <br />
        <label htmlFor="license-tier">Enter the license tier for coupons</label>
        <select
          className="ml-2 rounded border border-theme-600 px-4 py-1 w-32"
          value={generatedFor}
          onChange={(e) => {
            const selectedValue = e.target.value
            if (selectedValue) {
              setGeneratedFor(CouponGeneratedFor[selectedValue])
            }
          }}
        >
          {Object.keys(CouponGeneratedFor).map((gFor) => {
            return <option value={gFor}>{titleCase(gFor?.replaceAll("_", " "))}</option>
          })}
        </select>

        <br />
        <button
          className="px-4 py-2 rounded bg-theme-600 hover:bg-theme-800 text-white"
          onClick={async () => {
            const toastId = toast.loading("Creating coupons")
            try {
              const coupons = await createCouponsMutation({
                licenseTier,
                numberOfCouponsToCreate,
                generatedFor,
              })
              await invalidateQuery(getCoupons)
              toast.success(`${coupons.count} coupons created`, { id: toastId })
            } catch (error) {
              toast.error("Something went wrong", { id: toastId })
            }
          }}
        >
          Create Coupons
        </button>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminCouponsPage.authenticate = true

export default AdminCouponsPage
