import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { getSession, useSession } from "@blitzjs/auth"
import { usePaginatedQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, Suspense } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import { Candidate, Job } from "@prisma/client"
import Debouncer from "src/core/utils/debouncer"
import toast from "react-hot-toast"
import Confirm from "src/core/components/Confirm"
import Card from "src/core/components/Card"
import { TrashIcon, XIcon } from "@heroicons/react/outline"
import getCandidatePool from "src/candidate-pools/queries/getCandidatePool"
import removeCandidateFromPool from "src/candidate-pools/mutations/removeCandidateFromPool"
import Form from "src/core/components/Form"
import LabeledRatingField from "src/core/components/LabeledRatingField"
import getScoreAverage from "src/score-cards/utils/getScoreAverage"
import Pagination from "src/core/components/Pagination"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import getCandidatesWOAbility from "src/candidates/queries/getCandidatesWOAbility"
import getCandidate from "src/candidates/queries/getCandidate"
import { AuthorizationError } from "blitz"
import CandidatePoolLayout from "src/core/layouts/CandidatePoolLayout"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  // const session = await getSession(context.req, context.res)

  if (user) {
    try {
      await getCandidatePool(
        {
          where: {
            slug: (context?.params?.slug as string) || "0",
            companyId: session?.companyId || "0",
          },
        },
        { ...context.ctx }
      )
      return { props: { user: user, slug: context?.params?.slug } }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          } as any,
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/auth/login?next=/candidate-pools/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

export const Candidates = ({ slug }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const session = useSession()
  const tablePage = Number(router.query.page) || 0
  const [query, setQuery] = useState({})
  const [openConfirm, setOpenConfirm] = useState(false)
  const [candidateToRemoveFromPool, setCandidateToRemoveFromPool] = useState(
    null as (Candidate & { job: Pick<Job, "slug"> }) | null
  )
  const [removeCandidateFromPoolMutation] = useMutation(removeCandidateFromPool)

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

  const [{ candidates, hasMore, count }] = usePaginatedQuery(getCandidatesWOAbility, {
    where: {
      candidatePools: {
        some: {
          slug,
          companyId: session?.companyId || "0",
        },
      },
      ...query,
    },
    orderBy: { createdAt: "asc" },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  return (
    <>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Remove Candidate from Pool`}
        onSuccess={async () => {
          const toastId = toast.loading(`Removing Candidate from Pool`)
          try {
            if (!candidateToRemoveFromPool) {
              throw new Error("No candidate set to remove")
            }
            await removeCandidateFromPoolMutation({
              candidateId: candidateToRemoveFromPool.id,
              candidatePoolSlug: slug,
            })
            invalidateQuery(getCandidatesWOAbility)
            invalidateQuery(getCandidate)
            toast.success("Candidate removed from Pool", { id: toastId })
          } catch (error) {
            toast.error(`Failed to remove candidate from pool - ${error.toString()}`, {
              id: toastId,
            })
          }
          setOpenConfirm(false)
          setCandidateToRemoveFromPool(null)
        }}
      >
        Are you sure you want to remove the candidate from pool?
      </Confirm>

      <p className="font-bold text-xl text-neutral-700 capitalize text-center mb-5">
        {slug?.replaceAll("-", " ")}
      </p>

      <div className="flex items-center justify-center mb-10">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      {candidates?.length > 0 && (
        <Pagination
          endPage={endPage}
          hasNext={hasMore}
          hasPrevious={tablePage !== 0}
          pageIndex={tablePage}
          startPage={startPage}
          totalCount={count}
          resultName="candidate"
          hideIfSinglePage={true}
        />
      )}

      {candidates?.length === 0 ? (
        <div className="mt-10 w-full border-2 rounded-xl border-neutral-400 py-10 flex flex-col items-center justify-center space-y-5 text-neutral-700">
          <p>No Candidates</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center">
            {candidates.map((candidate) => {
              return (
                <Card key={candidate.id}>
                  <div className="space-y-2">
                    <div className="w-full relative">
                      <div className="font-bold flex md:justify-center lg:justify:center items-center">
                        <Link
                          legacyBehavior
                          prefetch={true}
                          href={Routes.SingleCandidatePage({
                            slug: candidate?.job?.slug,
                            candidateEmail: candidate?.email,
                          })}
                          passHref
                        >
                          <a className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 md:px-6 lg:px-6 truncate">
                            {candidate.name}
                          </a>
                        </Link>
                      </div>
                      <div className="absolute top-0.5 right-0">
                        <button
                          id={"delete-" + candidate.id}
                          className="float-right text-red-600 hover:text-red-800"
                          title="Remove Candidate"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setCandidateToRemoveFromPool(candidate)
                            setOpenConfirm(true)
                          }}
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="border-b-2 border-gray-50 w-full"></div>
                    <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                      <Form
                        noFormatting={true}
                        onSubmit={async () => {
                          return
                        }}
                      >
                        <LabeledRatingField
                          name="candidateAverageRating"
                          ratingClass="!flex items-center"
                          height={6}
                          value={getScoreAverage(
                            candidate?.scores?.map((score) => score.rating) || []
                          )}
                          disabled={true}
                        />
                      </Form>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

const SingleCandidatePoolPage = ({
  error,
  user,
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout title="Hire.win | Candidate Pool" user={user}>
      <Breadcrumbs />
      <CandidatePoolLayout>
        <br />
        <Suspense fallback="Loading...">
          <Candidates slug={slug} />
        </Suspense>
      </CandidatePoolLayout>
    </AuthLayout>
  )
}

SingleCandidatePoolPage.authenticate = true

export default SingleCandidatePoolPage
