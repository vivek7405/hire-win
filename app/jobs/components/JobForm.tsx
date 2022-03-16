import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form as InputForm } from "app/core/components/Form"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import { Category, Workflow, Form, SalaryType, EmploymentType } from "@prisma/client"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import getFormsWOPagination from "app/forms/queries/getFormsWOPagination"
import { useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "app/core/components/CheckboxField"
import { titleCase } from "app/core/utils/titleCase"
import LabeledTextValidatedField from "app/core/components/LabeledTextValidatedField"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  workflow?: Workflow // Need to be provided while editing the form
  form?: Form // Need to be provided while editing the form
}

export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: props.user?.id } })
  const [workflows] = useQuery(getWorkflowsWOPagination, { where: { userId: props.user?.id } })
  const [forms] = useQuery(getFormsWOPagination, { where: { userId: props.user?.id } })

  const [countryCode, setCountryCode] = useState(props.initialValues.country || "")
  const [stateCode, setStateCode] = useState(props.initialValues.state || "")

  return (
    <>
      <InputForm
        submitText="Submit"
        schema={Job}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="jobForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="title"
          label="Title"
          placeholder="Job Title"
          testid="jobTitle"
        />

        <div className="flex flex-col space-y-2 md:space-y-0 lg:space-y-0 w-full md:flex-row lg:flex-row md:space-x-6 lg:space-x-6">
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="country"
              label="Country"
              placeholder="Country where you are offering the job"
              testid="jobCountry"
              options={[
                ...Country.getAllCountries().map((c) => {
                  return { label: c.name, value: c.isoCode }
                }),
              ]}
              onChange={(val: any) => {
                setCountryCode(val)
              }}
            />
          </div>
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="state"
              label="State"
              placeholder="State where you are offering the job"
              testid="jobState"
              disabled={countryCode === ""}
              options={[
                ...State.getStatesOfCountry(countryCode).map((s) => {
                  return { label: s.name, value: s.isoCode }
                }),
              ]}
              onChange={(val: any) => {
                setStateCode(val)
              }}
            />
          </div>
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="city"
              label="City"
              placeholder="City where you are offering the job"
              testid="jobCity"
              disabled={stateCode === ""}
              options={[
                ...City.getCitiesOfState(countryCode, stateCode).map((c) => {
                  return { label: c.name, value: c.name }
                }),
              ]}
              onChange={(val: any) => {
                setStateCode(val)
              }}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 md:space-y-0 lg:space-y-0 w-full md:flex-row lg:flex-row md:space-x-6 lg:space-x-6">
          <div className="w-full md:w-1/4 lg:w-1/4">
            <LabeledReactSelectField
              name="currency"
              label="Currency"
              placeholder="Currency for salary"
              testid="jobCurrency"
              options={[
                ...Country.getAllCountries().map((c) => {
                  return { label: c.currency, value: c.currency }
                }),
              ]}
            />
          </div>
          <div className="w-full md:w-1/4 lg:w-1/4">
            <LabeledTextValidatedField
              type="number"
              min="0"
              name="minSalary"
              label="Minimum Salary"
              placeholder="Minimum salary for this job"
              testid="jobMinSalary"
            />
          </div>
          <div className="w-full md:w-1/4 lg:w-1/4">
            <LabeledTextValidatedField
              type="number"
              min="0"
              name="maxSalary"
              label="Maximum Salary"
              placeholder="Maximum salary for this job"
              testid="jobMaxSalary"
            />
          </div>
          <div className="w-full md:w-1/4 lg:w-1/4">
            <LabeledReactSelectField
              name="salaryType"
              label="Salary Type"
              placeholder="Hourly, Weekly, etc."
              testid="salaryType"
              defaultValue={Object.keys(SalaryType).find((type) => type === SalaryType.YEAR)}
              options={Object.keys(SalaryType).map((salaryType) => {
                let type = ""
                switch (salaryType) {
                  case SalaryType.HOUR:
                    type = "Hourly"
                    break
                  case SalaryType.DAY:
                    type = "Daily"
                    break
                  case SalaryType.WEEK:
                    type = "Weekly"
                    break
                  case SalaryType.MONTH:
                    type = "Monthly"
                    break
                  case SalaryType.YEAR:
                    type = "Yearly"
                    break
                  default:
                    type = "Hourly"
                    break
                }
                return { label: type, value: salaryType }
              })}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 md:space-y-0 lg:space-y-0 w-full md:flex-row lg:flex-row md:space-x-6 lg:space-x-6">
          <div className="w-full md:w-1/2 lg:w-1/2">
            <LabeledReactSelectField
              name="employmentType"
              label="Employment Type"
              placeholder="Full Time, Part Time, etc."
              testid="employmentType"
              isMulti={true}
              options={Object.keys(EmploymentType).map((employmentType) => {
                return {
                  label: titleCase(employmentType.replaceAll("_", " ")),
                  value: employmentType,
                }
              })}
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/2">
            <LabeledTextValidatedField
              type="date"
              name="validThrough"
              label="Valid Through"
              testid="jobValidThrough"
            />
          </div>
        </div>

        <div className="flex space-x-6">
          <div className="w-1/3">
            <LabeledReactSelectField
              name="categoryId"
              label="Category"
              placeholder="Job Category"
              testid="jobCategory"
              disabled={props.category && !categories.find((c) => c.id === props.category?.id)}
              // defaultValue={props.initialValues?.categoryId}
              options={
                !props.category || categories.find((c) => c.id === props.category?.id)
                  ? [
                      // { label: "Default", value: "" },
                      ...categories.map((c) => {
                        return { label: c.name!, value: c.id! }
                      }),
                    ]
                  : [{ label: props.category?.name!, value: props.category?.id! }]
              }
            />
          </div>
          <div className="w-1/3">
            <LabeledReactSelectField
              name="workflowId"
              label="Interview Workflow"
              placeholder="Interview Workflow"
              testid="jobWorkflow"
              disabled={props.workflow && !workflows.find((c) => c.id === props.workflow?.id)}
              // defaultValue={props.initialValues?.workflowId}
              options={
                !props.workflow || workflows.find((w) => w.id === props.workflow?.id)
                  ? [
                      // { label: "Default", value: "" },
                      ...workflows.map((w) => {
                        return { label: w.name!, value: w.id! }
                      }),
                    ]
                  : [{ label: props.workflow?.name!, value: props.workflow?.id! }]
              }
              defaultValue={workflows.find((w) => w.name === "Default")?.id}
            />
          </div>
          <div className="w-1/3">
            <LabeledReactSelectField
              name="formId"
              label="Application Form"
              placeholder="Job Application Form"
              testid="jobForm"
              disabled={props.form && !forms.find((c) => c.id === props.workflow?.id)}
              // defaultValue={props.initialValues?.workflowId}
              options={
                !props.form || forms.find((f) => f.id === props.form?.id)
                  ? [
                      ...forms.map((f) => {
                        return { label: f.name!, value: f.id! }
                      }),
                    ]
                  : [{ label: props.form?.name!, value: props.form?.id! }]
              }
              defaultValue={forms.find((f) => f.name === "Default")?.id}
            />
          </div>
        </div>

        <CheckboxField name="remote" label="Remote Job" testid="jobRemote" />

        <LabeledRichTextField
          name="description"
          label="Description"
          placeholder="Description"
          testid="jobDescription"
        />
      </InputForm>
    </>
  )
}

export default JobForm
