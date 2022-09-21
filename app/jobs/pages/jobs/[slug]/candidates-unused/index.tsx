// import React, { Suspense, useEffect, useMemo, useState } from "react"
// import {
//   InferGetServerSidePropsType,
//   GetServerSidePropsContext,
//   invokeWithMiddleware,
//   Link,
//   Routes,
//   AuthorizationError,
//   ErrorComponent,
//   getSession,
//   useRouter,
//   usePaginatedQuery,
// } from "blitz"
// import path from "path"
// import Guard from "app/guard/ability"
// import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
// import AuthLayout from "app/core/layouts/AuthLayout"
// import Breadcrumbs from "app/core/components/Breadcrumbs"

// import getJobWithGuard from "app/jobs/queries/getJobWithGuard"
// import Table from "app/core/components/Table"
// import getCandidates from "app/candidates/queries/getCandidates"
// import { AttachmentObject, ExtendedAnswer, ExtendedCandidate, ExtendedJob } from "types"

// import { QuestionType } from "@prisma/client"

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
//   // https://github.com/blitz-js/blitz/issues/794
//   path.resolve("next.config.js")
//   path.resolve("blitz.config.js")
//   path.resolve(".next/__db.js")
//   // End anti-tree-shaking
//   const user = await getCurrentUserServer({ ...context })
//   const session = await getSession(context.req, context.res)
//   const { can: canUpdate } = await Guard.can(
//     "update",
//     "job",
//     { session },
//     {
//       where: {
//         companyId_slug: {
//           companyId: session.companyId || "0",
//           slug: context?.params?.slug as string,
//         },
//       },
//     }
//   )

//   if (user) {
//     try {
//       const job = await invokeWithMiddleware(
//         getJobWithGuard,
//         {
//           where: { slug: context?.params?.slug as string },
//         },
//         { ...context }
//       )

//       return {
//         props: {
//           user: user,
//           canUpdate: canUpdate,
//           job: job,
//         },
//       }
//     } catch (error) {
//       if (error instanceof AuthorizationError) {
//         return {
//           props: {
//             error: {
//               statusCode: error.statusCode,
//               message: "You don't have permission",
//             },
//           },
//         }
//       } else {
//         return { props: { error: { statusCode: error.statusCode, message: error.message } } }
//       }
//     }
//   } else {
//     return {
//       redirect: {
//         destination: `/login?next=/jobs/${context?.params?.slug}`,
//         permanent: false,
//       },
//       props: {},
//     }
//   }
// }

// type CandidateProps = {
//   job: ExtendedJob
// }
// const Candidates = (props: CandidateProps) => {
//   const ITEMS_PER_PAGE = 12
//   const router = useRouter()
//   const tablePage = Number(router.query.page) || 0
//   const [data, setData] = useState<{}[]>([])
//   const [query, setQuery] = useState({})

//   useEffect(() => {
//     const search = router.query.search
//       ? {
//           AND: {
//             name: {
//               contains: JSON.parse(router.query.search as string),
//               mode: "insensitive",
//             },
//           },
//         }
//       : {}

//     setQuery(search)
//   }, [router.query])

//   const [{ candidates, hasMore, count }] = usePaginatedQuery(getCandidates, {
//     where: {
//       jobId: props.job?.id,
//       ...query,
//     },
//     skip: ITEMS_PER_PAGE * Number(tablePage),
//     take: ITEMS_PER_PAGE,
//   })

//   // Use blitz guard to check if user can update

//   let startPage = tablePage * ITEMS_PER_PAGE + 1
//   let endPage = startPage - 1 + ITEMS_PER_PAGE

//   if (endPage > count) {
//     endPage = count
//   }

//   useMemo(async () => {
//     let data: {}[] = []

//     await candidates?.forEach((candidate) => {
//       data = [
//         ...data,
//         {
//           ...candidate,
//         },
//       ]

//       setData(data)
//     })
//   }, [candidates])

//   const getDynamicColumn = (formQuestion) => {
//     return {
//       Header: formQuestion?.question?.name,
//       Cell: (props) => {
//         const answer: ExtendedAnswer = props.cell.row.original?.answers?.find(
//           (ans) => ans.question?.name === formQuestion?.question?.name
//         )

//         if (answer) {
//           const val = answer.value
//           const type = answer?.question?.type

//           switch (type) {
//             case QuestionType.URL:
//               return (
//                 <a
//                   href={val}
//                   className="text-theme-600 hover:text-theme-500"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   {val}
//                 </a>
//               )
//             case QuestionType.Multiple_select:
//               const answerSelectedOptionIds: String[] = JSON.parse(val)
//               const selectedOptions = answer?.question?.options
//                 ?.filter((op) => answerSelectedOptionIds?.includes(op.id))
//                 ?.map((op) => {
//                   return op.text
//                 })
//               return JSON.stringify(selectedOptions)
//             case QuestionType.Single_select:
//               return answer?.question?.options?.find((op) => val === op.id)?.text
//             case QuestionType.Attachment:
//               const attachmentObj: AttachmentObject = JSON.parse(val)
//               return (
//                 <a
//                   href={attachmentObj.Location}
//                   className="text-theme-600 hover:text-theme-500"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   {attachmentObj.Key}
//                 </a>
//               )
//             case QuestionType.Long_text:
//               return <p className="max-w-md overflow-auto">{val}</p>
//             default:
//               return val
//           }
//         }

//         return ""
//       },
//     }
//   }

//   type ColumnType = {
//     Header: string
//     accessor?: string
//     Cell?: (props) => any
//   }
//   let columns: ColumnType[] = [
//     {
//       Header: "Name",
//       accessor: "name",
//       Cell: (props) => {
//         return (
//           <>
//             <Link
//               prefetch={true}
//               href={Routes.SingleCandidatePage({
//                 slug: props.cell.row.original.job?.slug,
//                 candidateEmail: props.cell.row.original.email,
//               })}
//               passHref
//             >
//               <a className="text-theme-600 hover:text-theme-900">{props.value}</a>
//             </Link>
//           </>
//         )
//       },
//     },
//     {
//       Header: "Source",
//       accessor: "source",
//       Cell: (props) => {
//         return props.value.toString().replace("_", " ")
//       },
//     },
//     {
//       Header: "Email",
//       accessor: "email",
//     },
//     {
//       Header: "Resume",
//       accessor: "resume",
//       Cell: (props) => {
//         const attachmentObj = props.value
//         return (
//           <a
//             href={attachmentObj.Location}
//             className="text-theme-600 hover:text-theme-500"
//             target="_blank"
//             rel="noreferrer"
//           >
//             {attachmentObj.Key}
//           </a>
//         )
//       },
//     },
//   ]
//   props.job?.form?.questions
//     ?.filter((q) => !q.question.factory)
//     ?.forEach((formQuestion) => {
//       columns.push(getDynamicColumn(formQuestion))
//     })

//   columns.push({
//     Header: "",
//     accessor: "action",
//     Cell: (props) => {
//       return (
//         <>
//           <Link
//             prefetch={true}
//             href={Routes.CandidateSettingsPage({
//               slug: props.cell.row.original.job?.slug,
//               candidateEmail: props.cell.row.original.email,
//             })}
//             passHref
//           >
//             <a className="text-theme-600 hover:text-theme-900">Settings</a>
//           </Link>
//         </>
//       )
//     },
//   })

//   return (
//     <Table
//       columns={columns}
//       data={data}
//       pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
//       pageIndex={tablePage}
//       pageSize={ITEMS_PER_PAGE}
//       hasNext={hasMore}
//       hasPrevious={tablePage !== 0}
//       totalCount={count}
//       startPage={startPage}
//       endPage={endPage}
//     />
//   )
// }

// const CandidatesUnusedHome = ({
//   user,
//   job,
//   error,
//   canUpdate,
// }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
//   if (error) {
//     return <ErrorComponent statusCode={error.statusCode} title={error.message} />
//   }

//   return (
//     <AuthLayout user={user}>
//       <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
//       <br />
//       <Link prefetch={true} href={Routes.NewCandidateUnused({ slug: job?.slug! })} passHref>
//         <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
//           New Candidate
//         </a>
//       </Link>
//       {canUpdate && (
//         <Link prefetch={true} href={Routes.JobSettingsPage({ slug: job?.slug! })} passHref>
//           <a
//             className="float-right underline text-theme-600 mr-8 py-2 hover:text-theme-800"
//             data-testid={`${job?.title && `${job?.title}-`}settingsLink`}
//           >
//             Job Settings
//           </a>
//         </Link>
//       )}

//       <Suspense fallback="Loading...">
//         <Candidates job={job as any} />
//       </Suspense>
//     </AuthLayout>
//   )
// }

export default function CandidatesUnusedHome() {}
