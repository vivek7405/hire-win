import { SingleFileUploadField } from "src/core/components/SingleFileUploadField"
import { Form } from "src/core/components/Form"
import { UserObj } from "src/users/validations"
import LabeledTextField from "src/core/components/LabeledTextField"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import ThemePickerField from "src/core/components/ThemePickerField"
import { CompanyObj } from "../validations"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { getTailwindColors } from "src/core/utils/themeHelpers"
import ViewCareersPageButton from "./ViewCareersPageButton"
import LabeledQuillEditor from "src/core/components/LabeledQuillEditor"
import { PlanName } from "types"
import UpgradeMessage from "src/plans/components/UpgradeMessage"

type CompanyFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
  companySlugForCareersPage?: string
  onlyName?: boolean
  activePlanName: PlanName
}

export const CompanyForm = (props: CompanyFormProps) => {
  const tailwindColors = getTailwindColors(true)

  return (
    <>
      <div className="bg-white w-full">
        <Form
          header={props.header}
          subHeader={props.subHeader}
          submitText="Submit"
          schema={CompanyObj}
          initialValues={props.initialValues}
          onSubmit={props.onSubmit}
          className="max-w-xl mx-auto"
        >
          <LabeledTextField
            name="name"
            label="Company Name"
            subLabel="Make it as short as possible, eg. Acme instead of Acme Inc."
            placeholder="This shall appear on careers page"
            showAsterisk={true}
          />

          {!props.onlyName && (
            <>
              <LabeledTextField
                type="text"
                name="website"
                label="Website"
                placeholder="This shall be used to navigate to your website from careers page"
                testid="userUpdateWebsite"
              />

              <SingleFileUploadField
                showImage={true}
                accept="image/*"
                name="logo"
                label="Logo"
                subLabel="Logo shall appear as careers page header if provided"
                subLabel2="If not provided, the company name shall appear as careers page header"
              />

              {/* <LabeledRichTextField
          name="info"
          label="Info"
          placeholder="This shall appear on careers page"
          testid="userUpdateCompanyInfo"
        /> */}
              <LabeledQuillEditor
                name="info"
                label="Careers Page Description"
                placeholder="You may provide your company info here..."
              />

              {/* <ThemePickerField name="theme" label="Careers Page Theme" /> */}
              <div>
                <LabeledReactSelectField
                  name="theme"
                  label="Careers Page Theme"
                  disabled={props.activePlanName === PlanName.FREE}
                  options={Object.keys(tailwindColors)?.map((key) => {
                    return {
                      label: (
                        key.replace("-600", "").charAt(0).toUpperCase() +
                        key.replace("-600", "").slice(1)
                      )
                        .replace(/([A-Z])/g, " $1")
                        .trim(),
                      value: key.replace("-600", ""),
                      color: tailwindColors[key],
                    }
                  })}
                  isColored={true}
                />
                {props.activePlanName === PlanName.FREE && (
                  <div className="mt-2">
                    <UpgradeMessage message="Upgrade to change Careers Page Theme" />
                  </div>
                )}
              </div>

              {props.companySlugForCareersPage && (
                <div className="float-left">
                  <ViewCareersPageButton
                    companySlug={props.companySlugForCareersPage}
                    noPadding={true}
                  />
                </div>
              )}
            </>
          )}
        </Form>
      </div>
    </>
  )
}

export default CompanyForm
