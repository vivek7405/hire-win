import { gSSP } from "src/blitz-server";
import { useMutation, invalidateQuery } from "@blitzjs/rpc";
import { Routes } from "@blitzjs/next";
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import AuthLayout from "src/core/layouts/AuthLayout"
import EmailTemplateForm from "src/email-templates/components/EmailTemplateForm"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import createEmailTemplate from "src/email-templates/mutations/createEmailTemplate"
import path from "path"
import { EditorState, convertToRaw, convertFromRaw } from "draft-js"
import getEmailTemplatesWOPagination from "src/email-templates/queries/getEmailTemplatesWOPagination"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
})

const NewEmailTemplate = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createEmailTemplateMutation] = useMutation(createEmailTemplate)

  return (
    <AuthLayout title="New Question" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <EmailTemplateForm
          header="New Email Template"
          subHeader="HTML Template"
          initialValues={{ body: EditorState.createEmpty() }}
          onSubmit={async (values) => {
            const toastId = toast.loading("Adding template")
            try {
              if (values?.body) {
                values.body = convertToRaw(values?.body?.getCurrentContent())
              }

              await createEmailTemplateMutation({ ...values })
              await invalidateQuery(getEmailTemplatesWOPagination)
              toast.success("Template added successfully", { id: toastId })
            } catch (error) {
              toast.error(`Failed to add new template - ${error.toString()}`, { id: toastId })
            }
          }}
        />
      </div>
    </AuthLayout>
  )
}

export default NewEmailTemplate
