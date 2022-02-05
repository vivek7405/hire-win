import React from "react"
import {
  Routes,
  useRouter,
  useMutation,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "blitz"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"

import { RadioGroupField } from "app/core/components/RadioGroupField"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import toast from "react-hot-toast"

import createUser from "app/admin/mutations/admin/createUser"
import LabeledTextAreaField from "app/core/components/LabeledTextAreaField"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { EditorState, convertToRaw } from "draft-js"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    return {
      props: {
        user: user,
      },
    }
  } else {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
      props: {},
    }
  }
}

const NewUserAdminPage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createUserMutation] = useMutation(createUser)
  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Submit"
          initialValues={{
            email: "",
            companyName: "",
            companyInfo: EditorState.createEmpty(),
            website: "",
          }}
          onSubmit={async (values) => {
            values.companyInfo = convertToRaw(values?.companyInfo?.getCurrentContent())
            const toastId = toast.loading(() => <span>Creating User</span>)
            try {
              await createUserMutation({
                email: values.email,
              })
              toast.success(() => <span>User Created</span>, { id: toastId })
              router.push(Routes.AdminUser())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={"Create A New User"}
          subHeader={``}
        >
          <LabeledTextField name="email" label="Email" type="email" />
          <LabeledTextField name="companyName" label="Company Name" />
          <LabeledRichTextField
            name="companyInfo"
            label="Company Info"
            placeholder="This shall appear on Job Board"
          />
          <LabeledTextField name="website" label="Company Info" />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default NewUserAdminPage
