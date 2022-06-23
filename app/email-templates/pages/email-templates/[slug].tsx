import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useRouter,
  useMutation,
  invalidateQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getEmailTemplate from "app/email-templates/queries/getEmailTemplate"
import EmailTemplateForm from "app/email-templates/components/EmailTemplateForm"
import toast from "react-hot-toast"
import updateEmailTemplate from "app/email-templates/mutations/updateEmailTemplate"
import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import getEmailTemplates from "app/email-templates/queries/getEmailTemplates"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  //   const { can: canUpdate } = await Guard.can(
  //     "update",
  //     "emailTemplate",
  //     { session },
  //     { where: { slug: context?.params?.slug! } }
  //   )

  if (user) {
    try {
      const emailTemplate = await invokeWithMiddleware(
        getEmailTemplate,
        { where: { slug: context?.params?.slug! } },
        { ...context }
      )

      return {
        props: {
          user: user,
          //   canUpdate: canUpdate,
          emailTemplate: emailTemplate,
        },
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
        destination: `/login?next=/emailTemplates/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleEmailTemplatePage = ({
  user,
  emailTemplate,
  error,
}: //   canUpdate,
InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateEmailTemplateMutation] = useMutation(updateEmailTemplate)
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <EmailTemplateForm
        header="Edit Email Template"
        subHeader="HTML Template"
        initialValues={{
          subject: emailTemplate?.subject,
          body: EditorState.createWithContent(convertFromRaw(emailTemplate?.body || {})),
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading("Updating template")
          try {
            values.body = convertToRaw(values?.body?.getCurrentContent())
            await updateEmailTemplateMutation({
              where: { id: emailTemplate?.id },
              data: { ...values },
              initial: emailTemplate!,
            })
            await invalidateQuery(getEmailTemplates)
            toast.success("Template updated successfully", { id: toastId })
          } catch (error) {
            toast.error(`Failed to update template - ${error.toString()}`, { id: toastId })
          }
        }}
      />
    </AuthLayout>
  )
}

export default SingleEmailTemplatePage
