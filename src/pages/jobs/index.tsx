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

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  // const session = await getSession(context.req, context.res)
  const session = context.ctx.session

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
        userId: context.ctx.session.userId || "0",
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
      return {
        redirect: {
          destination: Routes.NewCompany().pathname,
          permanent: false,
        },
        props: {},
      }
    }
  }

  if (user && companyUser) {
    const { can: canCreate } = await Guard.can("create", "job", { ...context.ctx }, {})

    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    const parentCompanyUser = await getParentCompanyUser(
      {
        where: {
          parentCompanyId: companyUser?.company?.parentCompanyId || "0",
          userId: context?.ctx?.session?.userId || "0",
        },
      },
      context.ctx
    )

    if (user?.isFirstSignup) {
      return {
        redirect: {
          destination: Routes.Welcome().pathname,
          permanent: false,
        },
        props: {},
      }
    }

    return {
      props: {
        user,
        parentCompanyUser,
        companyUserRole: companyUser.role,
        company: companyUser.company,
        companyUsersLength: companyUsers?.length || 0,
        canCreate,
        activePlanName: activePlanName,
      } as any,
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

const CategoryFilterButtons = ({
  selectedCategoryId,
  setSelectedCategoryId,
  viewType,
  searchString,
}) => {
  const [categories] = useQuery(getUserJobCategoriesByViewType, {
    viewType,
    searchString,
  })

  return (
    <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
      <div
        className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
          selectedCategoryId === null
            ? "bg-theme-700 cursor-default"
            : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
        }`}
        onClick={() => {
          setSelectedCategoryId(null)
        }}
      >
        All
      </div>
      {categories?.map((category) => {
        return (
          <div
            key={category.id}
            className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
              selectedCategoryId === category.id
                ? "bg-theme-700 cursor-default"
                : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
            }`}
            onClick={async () => {
              setSelectedCategoryId(category.id)
              await invalidateQuery(getUserJobsByViewTypeAndCategory)
            }}
          >
            {category.name}
          </div>
        )
      })}
    </div>
  )
}

const Jobs = ({
  // user,
  parentCompanyUser,
  company,
  // subscription,
  // setOpenConfirm,
  // setConfirmMessage,
  // viewType,
  // introSteps,
  // introStepsEnabled,
  // isIntroFirstLoad,
  // setIsIntroFirstLoad,
  // Steps,
  companyUsersLength,
  activePlanName,
  canCreate,
  companyUserRole,
  user,
}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const session = useSession()
  const tablePage = Number(router.query.page) || 0
  // const [data, setData] = useState<{}[]>([])
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')
  // const [query, setQuery] = useState({})

  useEffect(() => {
    setSearchString((router.query.search as string) || '""')
  }, [router.query])

  const [openConfirm, setOpenConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(
    "Upgrade to the Recruiter Plan to create unlimited jobs. You can create only 1 job on the Free plan."
  )
  const [viewType, setViewType] = useState(JobViewType.Active)

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
        ...searchQuery,
      },
    })
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e) => {
    e.persist()
    return debouncer.execute(e)
  }

  const searchInput = (
    <input
      placeholder="Search"
      type="text"
      defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
      className={`border border-gray-300 lg:w-1/4 px-2 py-2 w-full rounded`}
      onChange={(e) => {
        execDebouncer(e)
      }}
    />
  )

  const [hideConfirmButton, setHideConfirmButton] = useState(false)
  const [cancelButtonText, setCancelButtonText] = useState("Cancel")
  const [confirmHeader, setConfirmHeader] = useState("Upgrade to the Recruiter Plan?")

  const newJobButton = (
    <button
      // disabled={viewType === JobViewType.Archived}
      className="text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      onClick={(e) => {
        e.preventDefault()
        // if (canCreate) {
        //   // return router.push(Routes.NewJob())
        //   setOpenModal(true)
        // } else {
        if (companyUserRole === CompanyUserRole.USER) {
          setConfirmHeader("No Permission")
          setConfirmMessage("You need admin rights for creating a job")
          setCancelButtonText("Ok")
          setHideConfirmButton(true)
          setOpenConfirm(true)
        } else {
          if (activePlanName === PlanName.FREE) {
            if (activeJobsCount >= FREE_JOBS_LIMIT) {
              setConfirmHeader("Reached Job Limit!")
              setConfirmMessage(
                `The Free Plan allows upto ${FREE_JOBS_LIMIT} active jobs. Since you already have ${FREE_JOBS_LIMIT} active jobs, archive one of your jobs to create a new one or else upgrade to the recruiter plan for having more active jobs.`
              )
              setCancelButtonText("Ok")
              setHideConfirmButton(true)
              setOpenConfirm(true)
              return
            }
          }
          // else if (activePlanName === PlanName.LIFETIME_SET1) {
          //   if (activeJobsCount >= LIFETIME_SET1_JOBS_LIMIT) {
          //     setConfirmHeader("Reached Job Limit!")
          //     setConfirmMessage(
          //       `The Lifetime Plan allows upto ${LIFETIME_SET1_JOBS_LIMIT} active jobs. Since you already have ${LIFETIME_SET1_JOBS_LIMIT} active jobs, archive one of your jobs to create a new one.`
          //     )
          //     setCancelButtonText("Ok")
          //     setHideConfirmButton(true)
          //     setOpenConfirm(true)
          //     return
          //   }
          // }

          setOpenModal(true)
        }
        // }
      }}
    >
      New Job
    </button>
  )

  const [openEmbedModal, setOpenEmbedModal] = useState(false)

  function RootPopMenu() {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center text-theme-600 hover:text-gray-800 outline-none">
            <DotsVerticalIcon className="h-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <LinkCopyPopMenuItem
                      companySlug={company?.slug || "0"}
                      active={active}
                      label="Copy Careers Page Link"
                    />
                  </a>
                )}
              </Menu.Item>
              {companyUserRole !== CompanyUserRole.USER && (
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setOpenEmbedModal(true)
                      }}
                    >
                      <span className="flex items-center space-x-2 whitespace-nowrap">
                        <CodeIcon className="w-5 h-5 text-neutral-600" />
                        <span>Embed Job Posts</span>
                      </span>
                    </a>
                  )}
                </Menu.Item>
              )}
              {/* <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <Link
                      prefetch={true}
                      href={Routes.ParentCompanyJobBoard({
                        parentCompanyId: company?.parentCompanyId || "0",
                      })}
                      passHref
                    >
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm",
                          "flex items-center space-x-2 cursor-pointer"
                        )}
                      >
                        <ExternalLinkIcon className="w-5 h-5 text-neutral-500" />
                        <span>View Job Board</span>
                      </a>
                    </Link>
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <LinkCopyPopMenuItem
                      userId={user?.id || "0"}
                      active={active}
                      label="Copy Job Board Link"
                    />
                  </a>
                )}
              </Menu.Item> */}
            </div>
            {/* <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <Link
                      prefetch={true}
                      href={Routes.JobDescriptionPage({
                        companySlug: job?.company?.slug,
                        jobSlug: job?.slug,
                      })}
                      passHref
                    >
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm",
                          "flex items-center space-x-2 cursor-pointer"
                        )}
                      >
                        <ExternalLinkIcon className="w-5 h-5 text-neutral-500" />
                        <span>View Job Listing</span>
                      </a>
                    </Link>
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <Link
                      prefetch={true}
                      href={
                        user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role ===
                          JobUserRole.OWNER ||
                        user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role ===
                          JobUserRole.ADMIN
                          ? Routes.JobSettingsPage({ slug: job?.slug! })
                          : Routes.JobSettingsSchedulingPage({ slug: job?.slug! })
                      }
                      passHref
                    >
                      <div
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm",
                          "flex items-center space-x-2 cursor-pointer"
                        )}
                      >
                        <CogIcon className="w-5 h-5 text-neutral-500" />
                        <span>Go to Job Settings</span>
                      </div>
                    </Link>
                  </a>
                )}
              </Menu.Item>
            </div> */}
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

  const [openModal, setOpenModal] = useState(false)
  const [createJobWithTitleMutation] = useMutation(createJobWithTitle)

  // const todayDate = new Date(new Date().toDateString())
  // const [utcDateNow, setUTCDateNow] = useState(null as any)
  // useEffect(() => {
  //   setUTCDateNow(moment().utc().toDate())
  // }, [viewType])
  // const validThrough = utcDateNow
  //   ? viewType === JobViewType.Expired
  //     ? { lt: utcDateNow }
  //     : { gte: utcDateNow }
  //   : todayDate

  // useEffect(() => {
  //   const search = router.query.search
  //     ? {
  //         AND: {
  //           job: {
  //             title: {
  //               contains: JSON.parse(router.query.search as string),
  //               mode: "insensitive",
  //             },
  //           },
  //         },
  //       }
  //     : {}

  //   setQuery(search)
  // }, [router.query])

  const [selectedCategoryId, setSelectedCategoryId] = useState(null as string | null)

  const [activeJobsCount] = useQuery(getActiveJobsCount, { companyId: company?.id || "0" })

  const [{ jobUsers, hasMore, count }] = usePaginatedQuery(getUserJobsByViewTypeAndCategory, {
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
    searchString,
    viewType,
    categoryId: selectedCategoryId,
    visibleOnlyToParentMembers:
      !!parentCompanyUser?.parentCompany?.name && parentCompanyUser ? {} : false,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  const [setJobHiddenMutation] = useMutation(setJobHidden)
  const [setJobArchivedMutation] = useMutation(setJobArchived)
  const [setJobSalaryVisibilityMutation] = useMutation(setJobSalaryVisibility)

  const [openJobArchiveConfirm, setOpenJobArchiveConfirm] = useState(false)
  const [jobToArchive, setJobToArchive] = useState(null as any)

  useEffect(() => {
    invalidateQuery(getUserJobCategoriesByViewType)
    invalidateQuery(getUserJobsByViewTypeAndCategory)
  }, [viewType])

  function PopMenu({ job, jobUser }) {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center text-theme-600 hover:text-theme-800 rounded-lg outline-none">
            <DotsVerticalIcon className="h-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {jobUser?.role !== JobUserRole.USER && (
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm cursor-pointer"
                      )}
                      onClick={async (e) => {
                        e.preventDefault()
                        const toastId = toast.loading(() => (
                          <span>
                            <b>
                              {job.hidden ? "Showing" : "Hiding"} job {job?.title}{" "}
                              {job.hidden ? "on" : "from"} Careers Page
                            </b>
                          </span>
                        ))

                        try {
                          await setJobHiddenMutation({
                            where: {
                              id: job?.id,
                            },
                            hidden: !job.hidden,
                          })

                          invalidateQuery(getUserJobsByViewTypeAndCategory)

                          toast.success(
                            () => (
                              <span>
                                <b>
                                  {job?.title} job is now{" "}
                                  {job.hidden ? "showing on" : "hidden from"} careers page
                                </b>
                              </span>
                            ),
                            { id: toastId }
                          )
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString(),
                            {
                              id: toastId,
                            }
                          )
                        }
                      }}
                    >
                      {job?.hidden ? (
                        <span className="flex items-center space-x-2">
                          <EyeIcon className="w-5 h-5 text-theme-600" />
                          <span className="whitespace-nowrap">Show on Careers Page</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <EyeOffIcon className="w-5 h-5 text-red-600" />
                          <span className="whitespace-nowrap">Hide from Careers Page</span>
                        </span>
                      )}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.preventDefault()

                        // Check for the job limit when the job is being restored
                        if (job?.archived) {
                          if (activePlanName === PlanName.FREE) {
                            if (activeJobsCount >= FREE_JOBS_LIMIT) {
                              setConfirmHeader("Upgrade to lifetime plan")
                              setConfirmMessage(
                                `The free plan allows upto ${FREE_JOBS_LIMIT} active jobs. Since this job already has ${FREE_JOBS_LIMIT} active jobs, you can't restore an archived job.`
                              )
                              setCancelButtonText("Ok")
                              setHideConfirmButton(true)
                              setOpenConfirm(true)
                              return
                            }
                          }
                          // else if (activePlanName === PlanName.LIFETIME_SET1) {
                          //   if (activeJobsCount >= LIFETIME_SET1_JOBS_LIMIT) {
                          //     setConfirmHeader("Reached Job Limit!")
                          //     setConfirmMessage(
                          //       `The lifetime plan allows upto ${LIFETIME_SET1_JOBS_LIMIT} active jobs. Since this job already has ${LIFETIME_SET1_JOBS_LIMIT} active jobs, you can't restore an archived job.`
                          //     )
                          //     setCancelButtonText("Ok")
                          //     setHideConfirmButton(true)
                          //     setOpenConfirm(true)
                          //     return
                          //   }
                          // }
                        }

                        setJobToArchive(job)
                        setOpenJobArchiveConfirm(true)
                      }}
                    >
                      {job?.archived ? (
                        <span className="flex items-center space-x-2 whitespace-nowrap">
                          <RefreshIcon className="w-5 h-5 text-theme-600" />
                          <span>Restore Job</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <ArchiveIcon className="w-5 h-5 text-red-600" />
                          <span>Archive Job</span>
                        </span>
                      )}
                    </a>
                  )}
                </Menu.Item>
              </div>
            )}
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <Link
                      prefetch={true}
                      href={Routes.JobDescriptionPage({
                        companySlug: job?.company?.slug,
                        jobSlug: job?.slug,
                      })}
                      passHref
                    >
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm",
                          "flex items-center space-x-2 cursor-pointer"
                        )}
                      >
                        <ExternalLinkIcon className="w-5 h-5 text-neutral-500" />
                        <span>View Job Listing</span>
                      </a>
                    </Link>
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}>
                    <LinkCopyPopMenuItem
                      companySlug={company?.slug || "0"}
                      jobSlug={job?.slug || "0"}
                      active={active}
                      label="Copy Job Post Link"
                    />
                  </a>
                )}
              </Menu.Item>
              {jobUser?.role !== JobUserRole.USER && (
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700")}
                    >
                      <Link
                        prefetch={true}
                        href={
                          jobUser?.role !== JobUserRole.USER
                            ? Routes.JobSettingsPage({ slug: job?.slug! })
                            : Routes.JobSettingsSchedulingPage({ slug: job?.slug! })
                        }
                        passHref
                      >
                        <div
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-4 py-2 text-sm",
                            "flex items-center space-x-2 cursor-pointer"
                          )}
                        >
                          <CogIcon className="w-5 h-5 text-neutral-500" />
                          <span>Go to Job Settings</span>
                        </div>
                      </Link>
                    </a>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

  const EmbedModalContent = ({}) => {
    const embedCode = `<iframe title="Job Posts" width="850" height="500" src="${`${
      process.env.NODE_ENV === "production" ? "https://hire.win" : "http://localhost:3000"
    }/${company?.slug}?embed=true`}"></iframe>`

    const [copied, setCopied] = useState(false)
    const textareaRef = useRef(null)

    return (
      <>
        <div className="relative p-5">
          <button
            className="absolute top-2 right-2"
            onClick={() => {
              setOpenEmbedModal(false)
            }}
          >
            <XIcon className="w-7 h-7 text-neutral-500 hover:text-neutral-700" />
          </button>
          <div className="flex flex-col space-y-5">
            <div className="text-xl pr-10">Embed job posts on your website</div>

            <hr />

            <div>
              <p>Copy the code below and paste inside your website's HTML files:</p>
              <textarea
                ref={textareaRef}
                className="w-full rounded border border-neutral-400 mt-2 text-neutral-700"
                readOnly={true}
                value={embedCode}
              />
            </div>

            <hr />

            <div className="flex flex-col items-center justify-center">
              <button
                disabled={copied}
                className={`px-4 py-2 rounded bg-theme-500 hover:bg-theme-600 text-white disabled:opacity-50`}
                onClick={() => {
                  textareaRef?.current && (textareaRef?.current as any)?.select()
                  navigator.clipboard.writeText(embedCode)
                  setCopied(true)
                }}
              >
                {copied ? (
                  <span className="flex items-center justify-center space-x-1 text-lg">
                    <CheckIcon className="w-6 h-6" />
                    <span>Copied</span>
                  </span>
                ) : (
                  "Copy Code"
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {activePlanName === PlanName.FREE && (
        <div className="w-full text-center mb-5 lg:mb-0">
          <Link href={Routes.UserSettingsBillingPage()} legacyBehavior passHref>
            <a className="text-theme-600 hover:text-theme-800 font-bold">
              Upgrade to Recruiter Plan!
            </a>
          </Link>
        </div>
      )}

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={confirmHeader}
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
        hideConfirm={hideConfirmButton}
        cancelText={cancelButtonText}
      >
        {confirmMessage}
      </Confirm>

      <Modal header="New Job" open={openEmbedModal} setOpen={setOpenEmbedModal}>
        <EmbedModalContent />
      </Modal>

      <Modal header="New Job" open={openModal} setOpen={setOpenModal}>
        <Form
          header={`New Job`}
          subHeader=""
          submitText="Create"
          schema={z.object({
            title: z.string().nonempty({ message: "Required" }),
          })}
          onSubmit={async (values) => {
            const toastId = toast.loading("Creating Job")
            try {
              // values["validThrough"] = new Date(moment().add(1, "months").toISOString())
              const job = await createJobWithTitleMutation({
                ...values,
              })
              router.push(Routes.JobSettingsPage({ slug: job.slug }))
              await invalidateQuery(getActiveJobsCount)
              invalidateQuery(getUserJobsByViewTypeAndCategory)
              invalidateQuery(getUserJobCategoriesByViewType)
              toast.success("Job created successfully", { id: toastId })
            } catch (error) {
              toast.error(`Failed to create new job - ${error.toString()}`, { id: toastId })
            }
            setOpenModal(false)
          }}
        >
          <LabeledTextField name="title" label="Title" placeholder="Enter Job Title" />
        </Form>
      </Modal>

      {/* Mobile Menu */}
      <div className="flex flex-col space-y-4 md:hidden lg:hidden">
        <div className="flex w-full items-center justify-between">
          {searchInput}
          <RootPopMenu />
          {newJobButton}
        </div>

        <Form noFormatting={true} onSubmit={async () => {}}>
          <RadioGroupField
            name="View"
            isBorder={true}
            options={[JobViewType.Active, JobViewType.Archived]}
            initialValue={JobViewType.Active}
            onChange={(value) => {
              setViewType(value)
            }}
          />
        </Form>

        <div className="flex justify-center space-x-6">
          {/* {subscriptionLink} */}
          {/* {viewCareersPageLink} */}
          <ViewCareersPageButton companySlug={company?.slug || "0"} />
        </div>
      </div>

      {/* Tablet and Desktop Menu */}
      <div className="hidden md:flex lg:flex items-center w-full justify-between">
        <div className="flex items-center">
          {searchInput}
          <div className="ml-2">
            <Form
              noFormatting={true}
              onSubmit={(value) => {
                return value
              }}
            >
              <RadioGroupField
                name="View"
                isBorder={false}
                options={[JobViewType.Active, JobViewType.Archived]}
                initialValue={JobViewType.Active}
                onChange={(value) => {
                  setViewType(value)
                }}
              />
            </Form>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* {subscriptionLink} */}
          {/* {viewCareersPageLink} */}
          <ViewCareersPageButton companySlug={company?.slug || "0"} />
          <RootPopMenu />
          {newJobButton}
        </div>
      </div>

      {/* {Steps &&
        companyUsersLength === 1 &&
        jobUsers?.length === 0 &&
        introStepsEnabled &&
        isIntroFirstLoad && (
          <Steps
            enabled={introStepsEnabled || false}
            steps={introSteps}
            initialStep={0}
            options={{
              nextToDone: true,
              dontShowAgain: true,
              dontShowAgainLabel: "Don't show again",
            }}
            onExit={() => {
              if (isIntroFirstLoad) {
                setIsIntroFirstLoad(false)
              }
            }}
          />
        )} */}
      {/* {Hints && introHintsEnabled && isIntroFirstLoad && (
        <Hints enabled={introHintsEnabled || false} hints={introHints} />
      )} */}

      <Confirm
        open={openJobArchiveConfirm}
        setOpen={setOpenJobArchiveConfirm}
        header={`${viewType === JobViewType.Archived ? "Restore" : "Archive"} Job - ${
          jobToArchive?.title
        }`}
        onSuccess={async () => {
          const toastId = toast.loading(
            `${viewType === JobViewType.Archived ? "Restoring" : "Archiving"} Job`
          )
          try {
            await setJobArchivedMutation({
              where: { id: jobToArchive?.id },
              archived: !jobToArchive?.archived,
            })
            toast.success(`Job ${viewType === JobViewType.Archived ? "Restored" : "Archived"}`, {
              id: toastId,
            })
            setSelectedCategoryId(null)
            await invalidateQuery(getActiveJobsCount)
            invalidateQuery(getUserJobsByViewTypeAndCategory)
            invalidateQuery(getUserJobCategoriesByViewType)
          } catch (error) {
            toast.error(
              `${
                viewType === JobViewType.Archived ? "Restoring" : "Archiving"
              } job failed - ${error.toString()}`,
              { id: toastId }
            )
          }
          setJobToArchive(null as any)
          setOpenJobArchiveConfirm(false)
        }}
      >
        Are you sure you want to {viewType === JobViewType.Archived ? "Restore" : "Archive"} the
        job?
      </Confirm>

      {jobUsers?.length > 0 && (
        <Pagination
          endPage={endPage}
          hasNext={hasMore}
          hasPrevious={tablePage !== 0}
          pageIndex={tablePage}
          startPage={startPage}
          totalCount={count}
          resultName={viewType === JobViewType.Archived ? "archived job" : "active job"}
        />
      )}

      {!jobUsers ||
        (jobUsers?.length === 0 && (
          <div className="mt-10 w-full border-2 rounded-xl border-neutral-400 py-10 flex flex-col items-center justify-center space-y-5 text-neutral-700">
            <p>{viewType === JobViewType.Archived ? "No Archived Jobs" : "No Active Jobs"}</p>
          </div>
        ))}

      {/* {jobUsers?.length > 0 && (
        <Suspense
          fallback={
            <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
              <div
                className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
                  selectedCategoryId === null
                    ? "bg-theme-700 cursor-default"
                    : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
                }`}
                onClick={() => {
                  setSelectedCategoryId(null)
                }}
              >
                All
              </div>
            </div>
          }
        >
          <CategoryFilterButtons
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            viewType={viewType}
            searchString={searchString}
          />
        </Suspense>
      )} */}

      {/* <div className="space-y-5 mt-5"> */}
      <div className="space-y-5">
        {jobUsers
          .map((jobUser) => {
            return {
              ...jobUser,
              hasByPassedPlanLimit: false,
              // hasByPassedPlanLimit:
              //   !(
              //     subscription?.status === SubscriptionStatus.ACTIVE ||
              //     subscription?.status === SubscriptionStatus.TRIALING
              //   ) && jobUsers?.length > 1,
              canUpdate: jobUser.role === "OWNER" || jobUser.role === "ADMIN",
            }
          })
          ?.map((jobUser) => {
            const job = jobUser.job

            const stages: Stage[] =
              job?.stages?.sort((a, b) => {
                return a?.order - b?.order
              }) || []

            return (
              <div key={job.id}>
                <Card isFull={true}>
                  <div className="bg-white w-full rounded px-3 py-1">
                    <div className="flex items-center justify-between pb-4 md:pb-0">
                      <div>
                        <div className="font-bold text-xl text-theme-900 whitespace-normal">
                          <a
                            data-testid={`joblink`}
                            className="cursor-pointer text-theme-600 hover:text-theme-800"
                            onClick={(e) => {
                              e.preventDefault()
                              // if (job.hasByPassedPlanLimit) {
                              //   setConfirmMessage(
                              //     "Upgrade to the Recruiter Plan to view this job since you've bypassed the 1 job limit on Free plan."
                              //   )
                              //   setOpenConfirm(true)
                              // } else {
                              router.push(Routes.SingleJobPage({ slug: job.slug }))
                              // }
                            }}
                          >
                            {job?.title}
                          </a>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Created{" "}
                          {moment(job.createdAt || undefined)
                            .local()
                            .fromNow()}{" "}
                          by{" "}
                          {session?.userId === job?.createdById
                            ? "you"
                            : getFirstWordIfLessThan(job?.createdBy?.name || "...", 10)}
                          {/* ,{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()
                            .includes("ago")
                            ? "expired"
                            : "expires"}{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()} */}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-center justify-center">
                        <a
                          title="Job Settings"
                          className="cursor-pointer text-theme-600 hover:text-theme-800 rounded-lg"
                          onClick={(e) => {
                            e.preventDefault()
                            // if (job.hasByPassedPlanLimit) {
                            //   setConfirmMessage(
                            //     "Upgrade to the Recruiter Plan to update this job since you've bypassed the 1 job limit on Free plan."
                            //   )
                            //   setOpenConfirm(true)
                            // } else {
                            jobUser.canUpdate
                              ? router.push(Routes.JobSettingsPage({ slug: job.slug }))
                              : router.push(Routes.JobSettingsSchedulingPage({ slug: job.slug }))
                            // }
                          }}
                        >
                          {jobUser?.role !== JobUserRole.USER && <CogIcon className="h-6 w-6" />}
                        </a>

                        {/* {jobUser.canUpdate && <PopMenu job={job} jobUser={jobUser} />} */}
                        <PopMenu job={job} jobUser={jobUser} />
                      </div>
                    </div>

                    <div className="py-2 md:py-0 lg:py-0 md:pb-4 lg:pb-4">
                      <div className="text-lg text-neutral-600 font-semibold flex md:justify-center lg:justify-center">
                        {job?.candidates?.length}{" "}
                        {job?.candidates?.length === 1 ? "candidate" : "candidates"}
                      </div>
                      {/* <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                            {stages?.map((ws) => {
                              return (
                                <div
                                  key={ws.id}
                                  className="p-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 w-32 flex flex-col items-center justify-center"
                                >
                                  <div className="overflow-hidden text-neutral-600">{ws.stage?.name}</div>
                                  <div className="text-neutral-600">
                                    {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
                                  </div>
                                </div>
                              )
                            })}
                          </div> */}
                      <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center">
                        {stages?.map((stage) => {
                          return (
                            <div
                              key={stage.id}
                              className="shadow drop-shadow overflow-auto p-1 m-1 rounded-lg border border-neutral-300 bg-white w-32 flex flex-col items-center justify-center"
                            >
                              <div className="overflow-hidden text-sm text-neutral-600 font-semibold whitespace-nowrap w-full text-center truncate">
                                {stage?.name}
                              </div>
                              <div className="text-neutral-600">
                                {
                                  job?.candidates?.filter(
                                    (c) => c.stageId === stage.id && !c.rejected
                                  )?.length
                                }
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap md:items-center md:justify-center lg:items-center lg:justify-center">
                      {(job?.city || job?.state || job?.country) && (
                        <span className="inline-block border-2 rounded-full px-3 py-1 text-sm font-semibold text-neutral-600 mr-2 mb-2">
                          {job?.city && <span>{job?.city},&nbsp;</span>}
                          {job?.state && job?.country && (
                            <span>
                              {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name}
                              ,&nbsp;
                            </span>
                          )}
                          {job?.country && (
                            <span>{Country.getCountryByCode(job?.country!)?.name}</span>
                          )}
                        </span>
                      )}
                      {job?.category && (
                        <span className="inline-block border-2 rounded-full px-3 py-1 text-sm font-semibold text-neutral-600 mr-2 mb-2">
                          {job.category?.name}
                        </span>
                      )}
                      {job?.jobType && (
                        <span className="inline-block border-2 rounded-full px-3 py-1 text-sm font-semibold text-neutral-600 mr-2 mb-2">
                          {titleCase(job.jobType?.replaceAll("_", " "))}
                        </span>
                      )}
                      {job?.remoteOption !== RemoteOption.No_Remote && (
                        <span className="inline-block border-2 rounded-full px-3 py-1 text-sm font-semibold text-neutral-600 mr-2 mb-2">
                          {job?.remoteOption?.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
      </div>
    </>
  )
}

const JobsHome = ({
  user,
  parentCompanyUser,
  companyUserRole,
  company,
  canCreate,
  companyUsersLength,
  activePlanName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  // used useEffect for setting openWelcomeModal to avoid Hydration error
  // const [openWelcomeModal, setOpenWelcomeModal] = useState(false)
  // useEffect(() => {
  //   setOpenWelcomeModal(user?.isFirstSignup || false)
  // }, [user?.isFirstSignup])

  // used useEffect for setting couponRedeemed to avoid Hydration error
  const [couponRedeemed, setCouponRedeemed] = useState(false)
  useEffect(() => {
    setCouponRedeemed(router.query.couponRedeemed ? true : false)
  }, [])

  // used useEffect for setting invalidCoupon to avoid Hydration error
  const [invalidCoupon, setInvalidCoupon] = useState(false)
  useEffect(() => {
    setInvalidCoupon(router.query.invalidCoupon ? true : false)
  }, [])

  return (
    <AuthLayout
      title="Hire.win | Jobs"
      user={user}
      // setNavbarIntroSteps={setNavbarIntroSteps}
      // setNavbarIntroHints={setNavbarIntroHints}
    >
      {invalidCoupon && (
        <InvalidCouponMessage userName={user?.name || ""} setInvalidCoupon={setInvalidCoupon} />
      )}

      {couponRedeemed && (
        <CouponRedeemedWelcome
          setCouponRedeemed={setCouponRedeemed}
          userName={user?.name || ""}
          userId={user?.id}
        />
      )}

      {/* <Modal header="" open={openWelcomeModal} setOpen={setOpenWelcomeModal}>
        <SignupWelcome
          setOpenModal={setOpenWelcomeModal}
          userName={user?.name || ""}
          userId={user?.id}
        />
      </Modal> */}

      <Suspense fallback={<p className="pt-7">Loading...</p>}>
        <Jobs
          // viewType={viewType}
          // user={user}
          parentCompanyUser={parentCompanyUser}
          company={company}
          // subscription={subscription}
          // setOpenConfirm={setOpenConfirm}
          // setConfirmMessage={setConfirmMessage}
          // introSteps={introSteps}
          // introStepsEnabled={introStepsEnabled}
          // isIntroFirstLoad={isIntroFirstLoad}
          // setIsIntroFirstLoad={setIsIntroFirstLoad}
          // Steps={Steps}
          companyUsersLength={companyUsersLength}
          activePlanName={activePlanName}
          canCreate={canCreate}
          companyUserRole={companyUserRole}
          user={user}
        />
      </Suspense>
    </AuthLayout>
  )
}

JobsHome.authenticate = true

export default JobsHome
