import { useEffect, useState, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useMutation,
  invalidateQuery,
  invokeWithMiddleware,
  AuthorizationError,
  getSession,
  useSession,
  ErrorComponent,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import { Candidate, Job } from "@prisma/client"
import Debouncer from "app/core/utils/debouncer"
import toast from "react-hot-toast"
import Confirm from "app/core/components/Confirm"
import Card from "app/core/components/Card"
import { TrashIcon, XIcon } from "@heroicons/react/outline"
import getCandidatePool from "app/candidate-pools/queries/getCandidatePool"
import removeCandidateFromPool from "app/candidate-pools/mutations/removeCandidateFromPool"
import Form from "app/core/components/Form"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import getScoreAverage from "app/score-cards/utils/getScoreAverage"
import Pagination from "app/core/components/Pagination"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import getCandidatesWOAbility from "app/candidates/queries/getCandidatesWOAbility"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
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
      await invokeWithMiddleware(
        getCandidatePool,
        {
          where: {
            slug: context?.params?.slug!,
            companyId: session?.companyId || "0",
          },
        },
        { ...context }
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
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/login?next=/candidate-pools/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

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

      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="candidate"
      />

      {candidates?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No candidates found</div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {candidates.map((candidate) => {
            return (
              <Card key={candidate.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      <Link
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
                        value={Math.round(
                          getScoreAverage(candidate?.scores?.map((score) => score.rating) || [])
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
    <AuthLayout title="CandidatePoolsHome | hire-win" user={user}>
      <Breadcrumbs />
      <br />
      <Suspense fallback="Loading...">
        <Candidates slug={slug} />
      </Suspense>
    </AuthLayout>
  )
}

SingleCandidatePoolPage.authenticate = true

export default SingleCandidatePoolPage
