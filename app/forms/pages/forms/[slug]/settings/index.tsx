import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useRouter,
  Routes,
  useMutation,
  AuthorizationError,
  ErrorComponent,
  getSession,
} from "blitz"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "app/guard/ability"

import FormForm from "app/forms/components/FormForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateForm from "app/forms/mutations/updateForm"
import getForm from "app/forms/queries/getForm"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const { can: canUpdate } = await Guard.can(
    "update",
    "form",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const form = await invokeWithMiddleware(
          getForm,
          { where: { slug: context?.params?.slug!, userId: user?.id } },
          { ...context }
        )

        return {
          props: {
            user: user,
            form: form,
            canUpdate,
          },
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        }
      }
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
        destination: `/login?next=/forms/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const FormSettingsPage = ({
  user,
  form,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateFormMutation] = useMutation(updateForm)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <FormForm
        header="Form Details"
        subHeader="Update your form details."
        initialValues={{
          name: form?.name,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Form</span>)
          try {
            await updateFormMutation({
              where: { slug: form?.slug },
              data: { ...values },
              initial: form!,
            })
            toast.success(() => <span>Form Updated</span>, { id: toastId })
            router.push(Routes.FormsHome())
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />
    </AuthLayout>
  )
}

export default FormSettingsPage
