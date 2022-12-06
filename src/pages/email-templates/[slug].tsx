import { gSSP } from "src/blitz-server"
import { useRouter } from "next/router"
import { getSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React from "react"
import path from "path"
import Guard from "src/guard/ability"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"

import getEmailTemplate from "src/email-templates/queries/getEmailTemplate"
import EmailTemplateForm from "src/email-templates/components/EmailTemplateForm"
import toast from "react-hot-toast"
import updateEmailTemplate from "src/email-templates/mutations/updateEmailTemplate"
import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import getEmailTemplatesWOPagination from "src/email-templates/queries/getEmailTemplatesWOPagination"
import { AuthorizationError } from "blitz"

export const getServerSideProps = gSSP(async (context) => {
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
      const emailTemplate = await getEmailTemplate(
        {
          where: {
            slug: (context?.params?.slug as string) || "0",
            companyId: session?.companyId || "0",
          },
        },
        { ...context.ctx }
      )

      return {
        props: {
          user: user,
          //   canUpdate: canUpdate,
          emailTemplate: emailTemplate,
        } as any,
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
        destination: `/auth/login?next=/emailTemplates/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

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
            if (values?.body) {
              values.body = convertToRaw(values?.body?.getCurrentContent())
            }

            await updateEmailTemplateMutation({
              where: { id: emailTemplate?.id },
              data: { ...values },
              initial: emailTemplate!,
            })
            await invalidateQuery(getEmailTemplatesWOPagination)
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
