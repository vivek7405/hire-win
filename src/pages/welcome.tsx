import { gSSP } from "src/blitz-server"
import dynamic from "next/dynamic"
import Link from "next/link"

import { getSession, useSession } from "@blitzjs/auth"

import { usePaginatedQuery, useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, Suspense, Fragment, useRef } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import Table from "src/core/components/Table"

import Guard from "src/guard/ability"
import Confirm from "src/core/components/Confirm"
import {
  CardType,
  DragDirection,
  ExtendedJob,
  IntroHint,
  IntroStep,
  JobViewType,
  Plan,
  PlanName,
  SubscriptionStatus,
} from "types"
import {
  Candidate,
  Category,
  CompanyUserRole,
  JobUserRole,
  RemoteOption,
  Stage,
} from "@prisma/client"
import moment from "moment"
import { Country, State } from "country-state-city"
import { titleCase } from "src/core/utils/titleCase"
import Form from "src/core/components/Form"
import LabeledToggleSwitch from "src/core/components/LabeledToggleSwitch"
import setJobHidden from "src/jobs/mutations/setJobHidden"
import toast from "react-hot-toast"
import Cards from "src/core/components/Cards"
import {
  ArchiveIcon,
  CheckIcon,
  ClipboardCopyIcon,
  CodeIcon,
  CogIcon,
  DotsVerticalIcon,
  ExclamationCircleIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
  XIcon,
} from "@heroicons/react/outline"
import getCategories from "src/categories/queries/getCategories"
import Card from "src/core/components/Card"
import Pagination from "src/core/components/Pagination"
import Debouncer from "src/core/utils/debouncer"
import setJobSalaryVisibility from "src/jobs/mutations/setJobSalaryVisibility"
import getCompany from "src/companies/queries/getCompany"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { loadStripe } from "@stripe/stripe-js"
import createStripeCheckoutSession from "src/companies/mutations/createStripeCheckoutSession"
import createStripeBillingPortal from "src/companies/mutations/createStripeBillingPortal"
import updateJob from "src/jobs/mutations/updateJob"
import setJobArchived from "src/jobs/mutations/setJobArchived"
import RadioGroupField from "src/core/components/RadioGroupField"
import getUserJobsByViewTypeAndCategory from "src/jobs/queries/getUserJobsByViewTypeAndCategory"
import getUserJobCategoriesByViewType from "src/categories/queries/getUserJobCategoriesByViewType"
import { StepsProps } from "intro.js-react"
import usePreviousValue from "src/core/hooks/usePreviousValue"
import { jobs } from "googleapis/build/src/apis/jobs"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import Modal from "src/core/components/Modal"
import LabeledTextField from "src/core/components/LabeledTextField"
import getJobs from "src/jobs/queries/getJobs"
import createJobWithTitle from "src/jobs/mutations/createJobWithTitle"
import { Menu, Transition } from "@headlessui/react"
import classNames from "src/core/utils/classNames"
import ViewCareersPageButton from "src/companies/components/ViewCareersPageButton"
import getFirstWordIfLessThan from "src/core/utils/getFirstWordIfLessThan"
import SignupWelcome from "src/auth/components/SignupWelcome"
import CouponRedeemedWelcome from "src/coupons/components/CouponRedeemedWelcome"
import getFirstWord from "src/core/utils/getFirstWordIfLessThan"
import InvalidCouponMessage from "src/coupons/components/InvalidCouponMessage"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_JOBS_LIMIT } from "src/plans/constants"
import { z } from "zod"
import getActiveJobsCount from "src/jobs/queries/getActiveJobsCount"
import LinkCopyPopMenuItem from "src/jobs/components/LinkCopyPopMenuItem"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"
import updateFirstSignup from "src/users/mutations/updateFirstSignup"
import assignAffiliateToUser from "src/affiliates/mutations/assignAffiliateToUser"
import { REFERRER_ID_COOKIE_NAME } from "src/core/constants"
import getCookie from "src/core/utils/getCookie"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return {
      props: { user } as any,
    }
  } else {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
      props: {},
    }
  }
})

const Welcome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [updateFirstSignupMutation] = useMutation(updateFirstSignup)
  const [assignAffiliateToUserMutation] = useMutation(assignAffiliateToUser)

  useEffect(() => {
    try {
      updateFirstSignupMutation({ userId: user?.id || "0", isFirstSignup: false })
      const referrerId = getCookie(REFERRER_ID_COOKIE_NAME)
      if (referrerId) {
        assignAffiliateToUserMutation({ userId: user?.id || "0", affiliateId: referrerId })
      }
    } catch (e) {}
  }, [])

  const router = useRouter()

  return (
    <AuthLayout title="Hire.win | Jobs" user={user}>
      <div className="w-fit mx-auto">
        {/* <button
          className="text-neutral-600 hover:text-neutral-900 absolute right-2 top-2"
          onClick={() => {
            // setCouponRedeemed(false)
          }}
        >
          <XIcon className="w-7 h-7" />
        </button> */}
        <div className="bg-white rounded-lg h-fit border border-gray-600 mb-5 p-5">
          <div className="font-bold text-2xl text-center">
            So glad to have you here, {user?.name || ""}!
          </div>
          <div className="mt-10 flex items-center justify-center space-x-3 text-8xl">
            <span>🎊</span>
            <span>🥳</span>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center space-y-8 pl-0 pt-5 sm:pt-0 sm:pl-5">
            <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
              <span>We just created a sample job for you and it is live on your careers page!</span>
            </div>
            <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
              <span>
                Feel free to{" "}
                <a
                  className="text-indigo-600 hover:underline"
                  href="javascript:void(Tawk_API.maximize())"
                >
                  get in touch
                </a>{" "}
                if you need any help 😇
                {/* Please get in touch if there's anything:{" "}
                <a className="text-theme-600 hover:underline" href="mailto:support@hire.win">
                  support@hire.win
                </a> */}
              </span>
            </div>

            <div>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl"
                onClick={() => {
                  // setOpenModal(false)
                  router.replace(Routes.JobsHome())
                }}
              >
                Start using Hire.win...
              </button>
            </div>

            {/* <div className="w-full text-center text-neutral-800 text-xl flex flex-col items-center justify-center">
              <span>Your feedback encourages us to add more awesome features!</span>
            </div>

            <a
              target="_blank"
              rel="external"
              href="https://www.producthunt.com/products/hire-win/reviews/new"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl text-center"
            >
              Leave us a feedback
            </a> */}
          </div>
        </div>
      </div>
      {/* <div className="bg-white rounded-lg flex flex-col items-center justify-center space-y-8 h-auto w-96 px-7 py-10">
        <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
          <span>Welcome, {user?.name || ""}!</span>
          <span>{"We're"} so happy to have you here.</span>
        </div>

        <div className="flex items-center justify-center space-x-3 text-8xl">
          <span>🎊</span>
          <span>🍰</span>
        </div>

        <div className="w-full text-center text-7xl font-bold text-neutral-800">Party!</div>

        <div className="flex items-center justify-center space-x-3 text-8xl">
          <span>🧁</span>
          <span>🎉</span>
        </div>

        <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
          <span>We just created a sample job for you and it is live on your careers page!</span>
        </div>

        <div>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl"
            onClick={() => {
              router.replace(Routes.JobsHome())
            }}
          >
            Start using Hire.win...
          </button>
        </div>
      </div> */}
    </AuthLayout>
  )
}

Welcome.authenticate = true

export default Welcome
