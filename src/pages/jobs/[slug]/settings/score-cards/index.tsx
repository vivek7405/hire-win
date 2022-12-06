import { gSSP } from "src/blitz-server"
import Link from "next/link"

import { useSession, getSession } from "@blitzjs/auth"

import { usePaginatedQuery, useQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, useMemo, Suspense } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import Table from "src/core/components/Table"

import Cards from "src/core/components/Cards"
import { CardType, DragDirection } from "types"
import { CogIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline"
import groupByKey from "src/core/utils/groupByKey"
import Debouncer from "src/core/utils/debouncer"
import Confirm from "src/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "src/core/components/Modal"
// import ScoreCardForm from "src/score-cards/components/ScoreCardForm"
import Card from "src/core/components/Card"
import Pagination from "src/core/components/Pagination"
import getJobStages from "src/stages/queries/getJobStages"
import getJob from "src/jobs/queries/getJob"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import getUser from "src/users/queries/getUser"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  // const user = await getCurrentUserServer({ ...context })
  // const session = await getSession(context.req, context.res)

  const user = await getUser(
    { where: { id: context.ctx.session.userId || "0" } },
    { ...context.ctx }
  )

  const job = await getJob(
    {
      where: {
        slug: (context?.params?.slug as string) || "0",
        companyId: context?.ctx?.session?.companyId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && job) {
    return { props: { user: user, job } }
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

const ScoreCards = ({ jobId, jobSlug }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  //   const [scoreCardToDelete, setScoreCardToDelete] = useState(null as ScoreCard | null)
  //   const [scoreCardToEdit, setScoreCardToEdit] = useState(null as any as ScoreCard)

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            name: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

  //   const [{ scoreCards, hasMore, count }] = usePaginatedQuery(getScoreCards, {
  //     where: {
  //       companyId: session.companyId || "0",
  //       ...query,
  //     },
  //     skip: ITEMS_PER_PAGE * Number(tablePage),
  //     take: ITEMS_PER_PAGE,
  //   })

  const [stages] = useQuery(getJobStages, {
    where: {
      jobId,
      ...query,
    },
    orderBy: { order: "asc" },
  })

  //   let startPage = tablePage * ITEMS_PER_PAGE + 1
  //   let endPage = startPage - 1 + ITEMS_PER_PAGE
  //   if (endPage > count) {
  //     endPage = count
  //   }

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

  return (
    <>
      {/* <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete ScoreCard - ${scoreCardToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting score card`)
          try {
            if (!scoreCardToDelete) {
              throw new Error("No score card set to delete")
            }
            await deleteScoreCardMutation({ id: scoreCardToDelete.id })
            toast.success("Score card deleted", { id: toastId })
            invalidateQuery(getScoreCards)
          } catch (error) {
            toast.error(`Deleting score card failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setScoreCardToDelete(null)
        }}
      >
        Are you sure you want to delete the score card?
      </Confirm>

      <Modal header="Score Card" open={openModal} setOpen={setOpenModal}>
        <ScoreCardForm
          header={`${scoreCardToEdit ? "Update" : "New"} Score Card`}
          subHeader=""
          initialValues={scoreCardToEdit ? { name: scoreCardToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = scoreCardToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Score Card" : "Creating Score Card")
            try {
              isEdit
                ? await updateScoreCardMutation({
                    where: { id: scoreCardToEdit.id },
                    data: { ...values },
                    initial: scoreCardToEdit,
                  })
                : await createScoreCardMutation({ ...values })
              await invalidateQuery(getScoreCards)
              toast.success(
                isEdit ? "Score Card updated successfully" : "Score Card added successfully",
                {
                  id: toastId,
                }
              )
              setScoreCardToEdit(null as any)
              setOpenModal(false)
            } catch (error) {
              toast.error(
                `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                { id: toastId }
              )
            }
          }}
        />
      </Modal> */}

      {/* <div>
        <button
          className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault()
            setScoreCardToEdit(null as any)
            setOpenModal(true)
          }}
        >
          New Score Card
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
      </div> */}

      {/* <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="score card"
      /> */}

      {stages?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Score Cards found</div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {stages?.map((stage) => {
            return (
              <Card isFull={true} key={stage.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                      <Link
                        legacyBehavior
                        prefetch={true}
                        href={Routes.JobSettingsSingleScoreCardPage({
                          slug: jobSlug,
                          stageSlug: stage.slug,
                        })}
                        passHref
                      >
                        <a
                          data-testid={`categorylink`}
                          className="text-theme-600 hover:text-theme-800 pr-12 md:px-12 lg:px-12 truncate"
                        >
                          {stage.name}
                        </a>
                      </Link>
                    </div>
                    {/* {!stage.allowEdit && (
                      <>
                        <div className="absolute top-0.5 right-5">
                          {stage.companyId === session.companyId && (
                            <button
                              id={"edit-" + stage.id}
                              className="float-right text-indigo-600 hover:text-indigo-800"
                              title="Edit ScoreCard"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setScoreCardToEdit(w)
                                setOpenModal(true)
                              }}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="absolute top-0.5 right-0">
                          <button
                            id={"delete-" + stage.id}
                            className="float-right text-red-600 hover:text-red-800"
                            title="Delete ScoreCard"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setScoreCardToDelete(w)
                              setOpenConfirm(true)
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )} */}
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                    {stage.scoreCardQuestions
                      // ?.sort((a, b) => {
                      //   return a.order - b.order
                      // })
                      .map((question) => {
                        return (
                          <div
                            key={question.id}
                            className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                          >
                            <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                              {question?.title}
                            </div>
                          </div>
                        )
                      })}
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

const JobSettingsScoreCardsPage = ({
  user,
  job,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Score Cards | hire.win" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          {/* <Link legacyBehavior prefetch={true} href={Routes.NewScoreCard()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Score Card
        </a>
      </Link>

      <Link legacyBehavior prefetch={true} href={Routes.CardQuestionsHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Question Pool
        </a>
      </Link> */}

          <Suspense fallback="Loading...">
            <ScoreCards jobId={job?.id || "0"} jobSlug={job?.slug || "0"} />
          </Suspense>
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

JobSettingsScoreCardsPage.authenticate = true

export default JobSettingsScoreCardsPage
