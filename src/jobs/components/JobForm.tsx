import { useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Job } from "src/jobs/validations"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import { Category, SalaryType, JobType, RemoteOption } from "@prisma/client"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { Suspense, useEffect, useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "src/core/components/CheckboxField"
import { titleCase } from "src/core/utils/titleCase"
import LabeledTextValidatedField from "src/core/components/LabeledTextValidatedField"
import ApplicationForm from "../../candidates/components/ApplicationForm"
import toast from "react-hot-toast"
import getFormQuestionsWOPaginationWOAbility from "src/form-questions/queries/getJobApplicationFormQuestions"
import MultiStepForm from "src/core/components/MultiStepForm"
import { FormStep, PlanName } from "types"
import { z } from "zod"
import { ArrowSmDownIcon } from "@heroicons/react/outline"
import { useFormContext } from "react-hook-form"
import getCategoriesWOPaginationWOAbility from "src/categories/queries/getCategoriesWOPaginationWOAbility"
import getSalaryIntervalFromSalaryType from "../utils/getSalaryIntervalFromSalaryType"
import Form from "src/core/components/Form"
import LabeledQuillEditor from "src/core/components/LabeledQuillEditor"
import UpgradeMessage from "src/plans/components/UpgradeMessage"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  // workflow?: ExtendedWorkflow // Need to be provided while editing the form
  // form?: Form // Need to be provided while editing the form
  jobId?: string // Need to be provided while editing the form
  companyId: string
  activePlanName: PlanName
}
export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPaginationWOAbility, {
    where: { companyId: props.companyId },
  })

  const [countryCode, setCountryCode] = useState(props.initialValues.country || "")
  const [stateCode, setStateCode] = useState(props.initialValues.state || "")
  const [city, setCity] = useState(props.initialValues.city || "")

  return (
    <Suspense fallback="Loading...">
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Save"
        schema={Job}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        // isSubmitTop={true}
        noPadding={true}
        unsavedChangesWarning={true}
        className="max-w-xl md:max-w-md mx-auto"
      >
        <div className="w-full flex flex-col space-y-16">
          <div className="flex flex-col space-y-6 w-full">
            <h3 className="font-bold">Basic</h3>
            <div className="w-full">
              <LabeledTextField
                type="text"
                name="title"
                label="Job Title"
                placeholder="Job Title"
                showAsterisk={true}
                testid="jobTitle"
              />
            </div>

            <div className="w-full">
              <LabeledReactSelectField
                name="categoryId"
                label="Job Category"
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

            <div className="w-full">
              <LabeledReactSelectField
                name="jobType"
                label="Job Type"
                placeholder="Full Time, Part Time, etc."
                testid="jobType"
                //   isMulti={true}
                options={Object.keys(JobType).map((jobType) => {
                  return {
                    label: titleCase(jobType.replaceAll("_", " ")),
                    value: jobType,
                  }
                })}
                defaultValue={JobType.FULL_TIME}
              />
            </div>

            <div className="w-full">
              <LabeledReactSelectField
                name="remoteOption"
                label="Remote Option"
                placeholder="Select one of the remote options"
                options={Object.values(RemoteOption)?.map((r, i) => {
                  return { label: r.replaceAll("_", " "), value: r }
                })}
                defaultValue={RemoteOption.No_Remote}
              />
            </div>

            {/* <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledTextValidatedField
              type="date"
              name="validThrough"
              label="Valid Through"
              testid="jobValidThrough"
            />
          </div> */}

            {/* <CheckboxField name="remote" label="Remote Job" testid="jobRemote" /> */}
            <CheckboxField
              name="postToGoogle"
              disabled={props.activePlanName === PlanName.FREE}
              label="Post to Google Jobs"
              subLabel="Fill in all the job details"
              subLabel2="Wait for Google to pick the job (~ 1 week)"
              testid="postToGoogle"
            />
            {props.activePlanName === PlanName.FREE && (
              <div className="mt-2">
                <UpgradeMessage message="Upgrade to Post to Google Jobs" />
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6 w-full">
            <h3 className="font-bold">Location</h3>
            <div className="w-full">
              {/* <LabeledTextField
              name="country"
              label="Country"
              placeholder="Country where you are offering the job"
            /> */}
              <LabeledReactSelectField
                name="country"
                label="Country"
                placeholder="Country where the job is offered"
                testid="jobCountry"
                options={Country.getAllCountries().map((c) => {
                  return { label: c.name, value: c.isoCode }
                })}
                onChange={(val: any) => {
                  setCountryCode(val)
                }}
                defaultValue={countryCode}
              />
            </div>

            <div className="w-full">
              {/* <LabeledTextField
              name="state"
              label="State"
              placeholder="State where you are offering the job"
            /> */}
              <LabeledReactSelectField
                name="state"
                label="State"
                placeholder="State where the job is offered"
                testid="jobState"
                disabled={countryCode === ""}
                options={State.getStatesOfCountry(countryCode).map((s) => {
                  return { label: s.name, value: s.isoCode }
                })}
                onChange={(val: any) => {
                  setStateCode(val)
                }}
                defaultValue={stateCode}
              />
            </div>

            <div className="w-full">
              {/* <LabeledTextField
              name="city"
              label="City"
              placeholder="City where you are offering the job"
            /> */}
              <LabeledReactSelectField
                name="city"
                label="City"
                placeholder="City where the job is offered"
                testid="jobCity"
                disabled={stateCode === ""}
                options={City.getCitiesOfState(countryCode, stateCode).map((c) => {
                  return { label: c.name, value: c.name }
                })}
                onChange={(val: any) => {
                  setCity(val)
                }}
                defaultValue={city}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-6 w-full">
            <h3 className="font-bold">Salary</h3>
            <div className="w-full">
              <LabeledReactSelectField
                name="currency"
                label="Currency"
                placeholder="Currency for salary"
                options={[
                  { label: "Select Currency", value: "" },
                  ...Country.getAllCountries()
                    // Unique Values
                    ?.filter(
                      (country, index, self) =>
                        self.findIndex((cont) => cont?.currency === country?.currency) === index
                    )
                    ?.map((c) => {
                      return { label: c.currency, value: c.currency }
                    }),
                ]}
              />
            </div>

            <div className="w-full">
              <LabeledTextValidatedField
                type="number"
                min="0"
                name="minSalary"
                label="Minimum Salary"
                placeholder="Minimum salary for this job"
              />
            </div>

            <div className="w-full">
              <LabeledTextValidatedField
                type="number"
                min="0"
                name="maxSalary"
                label="Maximum Salary"
                subLabel="Provide min salary and leave max salary blank to display a fixed salary"
                placeholder="Maximum salary for this job"
              />
            </div>

            <div className="w-full">
              <LabeledReactSelectField
                name="salaryType"
                label="Salary Interval"
                placeholder="Hourly, Weekly, etc."
                defaultValue={Object.keys(SalaryType).find((type) => type === SalaryType.YEAR)}
                options={Object.keys(SalaryType).map((salaryType) => {
                  const type = getSalaryIntervalFromSalaryType(salaryType)
                  return { label: type, value: salaryType }
                })}
              />
            </div>

            <div className="w-full">
              <CheckboxField name="showSalary" label="Show salary on careers page" />
            </div>
          </div>
        </div>
      </Form>
    </Suspense>
  )
}

export default JobForm
