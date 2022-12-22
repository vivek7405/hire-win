import { gSSP } from "src/blitz-server"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { useMutation } from "@blitzjs/rpc"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { BlitzPage, ErrorComponent, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { SignupForm } from "src/auth/components/SignupForm"
import transparentLogoColored from "src/assets/logo_transparent_colored.png"
import path from "path"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import LogoBrand from "src/assets/LogoBrand"
import Form from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import AuthForm from "src/auth/components/AuthForm"
import { z } from "zod"
import confirmEmail from "src/auth/mutations/confirmEmail"
import toast from "react-hot-toast"
import { getSession, useSession } from "@blitzjs/auth"
import redeemCoupon from "src/coupons/mutations/redeemCoupon"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"

export const getServerSideProps = gSSP(async (context) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  const user = await getCurrentUserServer({ ...context })

  // const session = await getSession(context.req, context.res)
  const session = context?.ctx?.session

  let companyUser = await getCompanyUser(
    {
      where: {
        companyId: session.companyId || "0",
        userId: session.userId || "0",
      },
    },
    { ...context.ctx }
  )

  const companyUsers = await getCompanyUsers(
    {
      where: {
        // companyId: session.companyId || "0",
        userId: session.userId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && !companyUser) {
    if (companyUsers && companyUsers.length > 0) {
      await session.$setPublicData({ companyId: companyUsers[0]?.companyId || "0" })
      companyUser = await getCompanyUser(
        {
          where: {
            companyId: session.companyId || "0",
            userId: session.userId || "0",
          },
        },
        { ...context.ctx }
      )
    } else {
      // If the user has no companies created, redirect them to the create company page
      // and make sure the user redirects back to this page after creating their first company
      return {
        redirect: {
          destination: `${Routes.NewCompany().pathname}?next=/redeem/${
            (context?.params?.couponId as string) || "0"
          }`,
          permanent: false,
        },
        props: {},
      }
    }
  }

  if (user) {
    try {
      await redeemCoupon(
        {
          couponId: (context?.params?.couponId as string) || "0",
        },
        { ...context.ctx }
      )

      return {
        redirect: {
          destination: `${Routes.JobsHome().pathname}?couponRedeemed=true`,
          permanent: false,
        },
        props: {},
      }
    } catch (error) {
      return {
        redirect: {
          destination: `${Routes.JobsHome().pathname}?invalidCoupon=true`,
          permanent: false,
        },
        props: {},
      }
    }
  } else {
    // Redirect user to signup
    return {
      redirect: {
        destination: `${Routes.OldSignupPage().pathname}?next=/redeem/${context?.params?.couponId}`,
        permanent: false,
      },
      props: {},
    }
  }
})

const RedeemCouponPage = ({}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const { coupon } = router.query

  return (
    <>
      <Head>
        <title>Hire.win | Redemption</title>
      </Head>
      <div>Redeem Coupon</div>
    </>
  )
}

export default RedeemCouponPage
