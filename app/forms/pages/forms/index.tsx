import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
  useSession,
  useMutation,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getForms from "app/forms/queries/getForms"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection } from "types"
import { CogIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline"
import getFormsWOPagination from "app/forms/queries/getFormsWOPagination"
import { Form } from "@prisma/client"
import deleteForm from "app/forms/mutations/deleteForm"
import createForm from "app/forms/mutations/createForm"
import updateForm from "app/forms/mutations/updateForm"
import Debouncer from "app/core/utils/debouncer"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "app/core/components/Modal"
import FormForm from "app/forms/components/FormForm"
import Card from "app/core/components/Card"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
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
}

const Forms = () => {
  const router = useRouter()
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [formToDelete, setFormToDelete] = useState(null as any as Form)
  const [deleteFormMutation] = useMutation(deleteForm)
  const [formToEdit, setFormToEdit] = useState(null as any as Form)
  const [openModal, setOpenModal] = useState(false)
  const [createFormMutation] = useMutation(createForm)
  const [updateFormMutation] = useMutation(updateForm)

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

  const [forms] = useQuery(getFormsWOPagination, {
    where: {
      companyId: session.companyId || 0,
      ...query,
    },
  })

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
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Form - ${formToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Form`)
          try {
            await deleteFormMutation({ id: formToDelete?.id })
            toast.success("Form Deleted", { id: toastId })
            setOpenConfirm(false)
            setFormToDelete(null as any)
            invalidateQuery(getFormsWOPagination)
          } catch (error) {
            toast.error(`Deleting form failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the form?
      </Confirm>

      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setFormToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Form
      </button>

      <Modal header="Form" open={openModal} setOpen={setOpenModal}>
        <FormForm
          header={`${formToEdit ? "Update" : "New"} Form`}
          subHeader=""
          initialValues={formToEdit ? { name: formToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = formToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Form" : "Creating Form")
            try {
              isEdit
                ? await updateFormMutation({
                    where: { id: formToEdit.id },
                    data: { ...values },
                    initial: formToEdit,
                  })
                : await createFormMutation({ ...values })
              await invalidateQuery(getFormsWOPagination)
              toast.success(isEdit ? "Form updated successfully" : "Form added successfully", {
                id: toastId,
              })
              setFormToEdit(null as any)
              setOpenModal(false)
            } catch (error) {
              toast.error(
                `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                { id: toastId }
              )
            }
          }}
        />
      </Modal>

      <input
        placeholder="Search"
        type="text"
        defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
        className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
        onChange={(e) => {
          execDebouncer(e)
        }}
      />

      {forms?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Forms found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {forms.map((w) => {
            return (
              <Card isFull={true} key={w.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                      <Link prefetch={true} href={Routes.SingleFormPage({ slug: w.slug })} passHref>
                        <a
                          data-testid={`categorylink`}
                          className="text-theme-600 hover:text-theme-800"
                        >
                          {w.name}
                        </a>
                      </Link>
                    </div>
                    {!w.factory && (
                      <>
                        <div className="absolute top-0.5 right-5">
                          {w.companyId === session.companyId && (
                            <button
                              id={"edit-" + w.id}
                              className="float-right text-indigo-600 hover:text-indigo-800"
                              title="Edit Form"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setFormToEdit(w)
                                setOpenModal(true)
                              }}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="absolute top-0.5 right-0">
                          <button
                            id={"delete-" + w.id}
                            className="float-right text-red-600 hover:text-red-800"
                            title="Delete Form"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setFormToDelete(w)
                              setOpenConfirm(true)
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {`${w.questions?.length} ${
                      w.questions?.length === 1 ? "Question" : "Questions"
                    } · ${w.jobs?.length} ${w.jobs?.length === 1 ? "Job" : "Jobs"}`}
                  </div>
                  <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                    {w.questions
                      // ?.sort((a, b) => {
                      //   return a.order - b.order
                      // })
                      .map((ws) => {
                        return (
                          <div
                            key={ws.id}
                            className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                          >
                            <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                              {ws.question?.name}
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

// const Forms = ({ user }) => {
//   const ITEMS_PER_PAGE = 12
//   const router = useRouter()
//   const session = useSession()
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

//   // const [{ forms, hasMore, count }] = usePaginatedQuery(getForms, {
//   //   where: {
//   //     userId: user?.id,
//   //     ...query,
//   //   },
//   //   skip: ITEMS_PER_PAGE * Number(tablePage),
//   //   take: ITEMS_PER_PAGE,
//   // })

//   // let startPage = tablePage * ITEMS_PER_PAGE + 1
//   // let endPage = startPage - 1 + ITEMS_PER_PAGE

//   // if (endPage > count) {
//   //   endPage = count
//   // }

//   const [forms] = useQuery(getFormsWOPagination, {
//     where: {
//       companyId: session.companyId || 0,
//       ...query,
//     },
//   })

//   useMemo(async () => {
//     let data: {}[] = []

//     await forms.forEach((form) => {
//       data = [
//         ...data,
//         {
//           ...form,
//           canUpdate: form.companyId === session.companyId,
//         },
//       ]

//       setData(data)
//     })
//   }, [forms, session.companyId])

//   // let columns = [
//   //   {
//   //     Header: "Name",
//   //     accessor: "name",
//   //     Cell: (props) => {
//   //       return (
//   //         <Link prefetch={true} href={Routes.SingleFormPage({ slug: props.cell.row.original.slug })} passHref>
//   //           <a data-testid={`formlink`} className="text-theme-600 hover:text-theme-900">
//   //             {props.cell.row.original.name}
//   //           </a>
//   //         </Link>
//   //       )
//   //     },
//   //   },
//   //   {
//   //     Header: "Questions",
//   //     Cell: (props) => {
//   //       return props.cell.row.original.questions.length
//   //     },
//   //   },
//   //   {
//   //     Header: "",
//   //     accessor: "action",
//   //     Cell: (props) => {
//   //       return (
//   //         <>
//   //           {props.cell.row.original.canUpdate && (
//   //             <Link prefetch={true} href={Routes.FormSettingsPage({ slug: props.cell.row.original.slug })} passHref>
//   //               <a className="text-theme-600 hover:text-theme-900">Settings</a>
//   //             </Link>
//   //           )}
//   //         </>
//   //       )
//   //     },
//   //   },
//   // ]

//   // return (
//   //   <Table
//   //     columns={columns}
//   //     data={data}
//   //     pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
//   //     pageIndex={tablePage}
//   //     pageSize={ITEMS_PER_PAGE}
//   //     hasNext={hasMore}
//   //     hasPrevious={tablePage !== 0}
//   //     totalCount={count}
//   //     startPage={startPage}
//   //     endPage={endPage}
//   //   />
//   // )

//   const getCards = (forms) => {
//     return forms.map((f) => {
//       return {
//         id: f.id,
//         title: f.name,
//         description: `${f.questions?.length} ${
//           f.questions?.length === 1 ? "Question" : "Questions"
//         }`,
//         renderContent: (
//           <>
//             <div className="space-y-2">
//               <div className="w-full relative">
//                 <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
//                   <Link prefetch={true} href={Routes.SingleFormPage({ slug: f.slug })} passHref>
//                     <a data-testid={`formlink`} className="text-theme-600 hover:text-theme-800">
//                       {f.name}
//                     </a>
//                   </Link>
//                 </div>
//                 <div className="absolute top-0.5 right-0">
//                   {f.canUpdate && (
//                     <Link prefetch={true} href={Routes.FormSettingsPage({ slug: f.slug })} passHref>
//                       <a className="float-right text-theme-600 hover:text-theme-800">
//                         <CogIcon className="h-6 w-6" />
//                       </a>
//                     </Link>
//                   )}
//                 </div>
//               </div>
//               <div className="border-b-2 border-gray-50 w-full"></div>
//               <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
//                 {`${f.questions?.length} ${
//                   f.questions?.length === 1 ? "Question" : "Questions"
//                 } · ${f.jobs?.length} ${f.jobs?.length === 1 ? "Job" : "Jobs"}`}
//               </div>
//               <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
//                 {f.questions
//                   ?.sort((a, b) => {
//                     return a.order - b.order
//                   })
//                   .map((fq) => {
//                     return (
//                       <div
//                         key={fq.id}
//                         className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
//                       >
//                         <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
//                           {fq.question?.name}
//                         </div>
//                       </div>
//                     )
//                   })}
//               </div>
//             </div>
//           </>
//           // <>
//           //   <div>
//           //     <span>
//           //       <div className="w-full relative">
//           //         <div className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between">
//           //           <Link prefetch={true} href={Routes.SingleFormPage({ slug: f.slug })} passHref>
//           //             <a data-testid={`formlink`} className="text-theme-600 hover:text-theme-800">
//           //               {f.name}
//           //             </a>
//           //           </Link>
//           //         </div>
//           //         <div className="absolute top-0.5 right-0">
//           //           {f.canUpdate && (
//           //             <Link prefetch={true} href={Routes.FormSettingsPage({ slug: f.slug })} passHref>
//           //               <a className="float-right text-theme-600 hover:text-theme-800">
//           //                 <CogIcon className="h-5 w-5" />
//           //               </a>
//           //             </Link>
//           //           )}
//           //         </div>
//           //       </div>
//           //     </span>
//           //     <div className="pt-2.5">
//           //       {`${f.questions?.length} ${f.questions?.length === 1 ? "Question" : "Questions"}`}
//           //     </div>
//           //   </div>
//           // </>
//         ),
//       }
//     }) as CardType[]
//   }

//   const [cards, setCards] = useState(getCards(data))
//   useEffect(() => {
//     setCards(getCards(data))
//   }, [data])

//   return (
//     <Cards
//       cards={cards}
//       setCards={setCards}
//       noPagination={true}
//       mutateCardDropDB={(source, destination, draggableId) => {}}
//       droppableName="forms"
//       isDragDisabled={true}
//       direction={DragDirection.VERTICAL}
//       isFull={true}
//     />
//   )
// }

const FormsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="FormsHome | hire-win" user={user}>
      {/* <Link prefetch={true} href={Routes.NewForm()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Form
        </a>
      </Link>

      <Link prefetch={true} href={Routes.QuestionsHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Question Pool
        </a>
      </Link> */}

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Forms />
      </Suspense>
    </AuthLayout>
  )
}

FormsHome.authenticate = true

export default FormsHome
