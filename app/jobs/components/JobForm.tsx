import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { useQuery } from "blitz"
import { Category, SalaryType, EmploymentType, RemoteOption } from "@prisma/client"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import { Suspense, useEffect, useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "app/core/components/CheckboxField"
import { titleCase } from "app/core/utils/titleCase"
import LabeledTextValidatedField from "app/core/components/LabeledTextValidatedField"
import ApplicationForm from "../../candidates/components/ApplicationForm"
import toast from "react-hot-toast"
import getFormQuestionsWOPaginationWOAbility from "app/form-questions/queries/getJobApplicationFormQuestions"
import MultiStepForm from "app/core/components/MultiStepForm"
import { FormStep } from "types"
import { z } from "zod"
import { ArrowSmDownIcon } from "@heroicons/react/outline"
import { useFormContext } from "react-hook-form"
import getCategoriesWOPaginationWOAbility from "app/categories/queries/getCategoriesWOPaginationWOAbility"
import getSalaryIntervalFromSalaryType from "../utils/getSalaryIntervalFromSalaryType"
import Form from "app/core/components/Form"

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
}
export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPaginationWOAbility, {
    where: { companyId: props.companyId },
  })

  const steps = ["Basic", "Location", "Salary", "Other"]
  const [step, setStep] = useState(steps[0])

  const [countryCode, setCountryCode] = useState(props.initialValues.country || "")
  const [stateCode, setStateCode] = useState(props.initialValues.state || "")
  const [city, setCity] = useState(props.initialValues.city || "")

  return (
    <Suspense fallback="Loading...">
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Submit"
        schema={Job}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        isSubmitTop={true}
      >
        <div className="overflow-auto flex justify-between whitespace-nowrap items-start space-x-4">
          {steps.map((stp, index) => {
            return (
              <>
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    setStep(stp)
                  }}
                >
                  <span
                    className={`${
                      step === stp ? "text-theme-400" : "text-neutral-400"
                    } font-semibold`}
                  >
                    {stp}
                  </span>
                  {step === stp && (
                    <span className="w-4 h-4 border-2 rounded-full border-theme-300 bg-theme-500" />
                  )}
                </div>

                {index + 1 < steps.length && <hr className="border-2 w-full mt-3" />}
              </>
            )
          })}
        </div>

        <div
          className={`${
            step === steps[0] ? "flex" : "hidden"
          } flex-col space-y-6 w-full sm:w-3/5 mx-auto`}
        >
          <LabeledTextField
            type="text"
            name="title"
            label="Title"
            placeholder="Job Title"
            testid="jobTitle"
          />

          <LabeledRichTextField
            name="description"
            label="Description"
            placeholder="Description"
            testid="jobDescription"
          />

          <LabeledReactSelectField
            name="remoteOption"
            label="Remote Option"
            placeholder="Select one of the remote options"
            options={Object.values(RemoteOption)?.map((r, i) => {
              return { label: r.replaceAll("_", " "), value: r }
            })}
            defaultValue={RemoteOption.No_Remote}
          />

          {/* <CheckboxField name="remote" label="Remote Job" testid="jobRemote" /> */}
          {/* <CheckboxField name="postToGoogle" label="Post to Google Jobs" testid="postToGoogle" /> */}
        </div>

        <div
          className={`${
            step === steps[1] ? "flex" : "hidden"
          } flex-col space-y-6 w-full items-center`}
        >
          <div className="w-full md:w-1/3">
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
              options={[
                ...Country.getAllCountries().map((c) => {
                  return { label: c.name, value: c.isoCode }
                }),
              ]}
              onChange={(val: any) => {
                setCountryCode(val)
                props.initialValues.country = val
              }}
              defaultValue={countryCode}
            />
          </div>

          <div className="w-full md:w-1/3">
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
              options={[
                ...State.getStatesOfCountry(countryCode).map((s) => {
                  return { label: s.name, value: s.isoCode }
                }),
              ]}
              onChange={(val: any) => {
                setStateCode(val)
                props.initialValues.state = val
              }}
              defaultValue={stateCode}
            />
          </div>

          <div className="w-full md:w-1/3">
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
              options={[
                ...City.getCitiesOfState(countryCode, stateCode).map((c) => {
                  return { label: c.name, value: c.name }
                }),
              ]}
              onChange={(val: any) => {
                setCity(val)
                props.initialValues.city = val
              }}
              defaultValue={city}
            />
          </div>
        </div>

        <div
          className={`${
            step === steps[2] ? "flex" : "hidden"
          } flex-col space-y-6 w-full items-center`}
        >
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="currency"
              label="Currency"
              placeholder="Currency for salary"
              testid="jobCurrency"
              options={[
                { label: "Select Currency", value: "" },
                ...Country.getAllCountries().map((c) => {
                  return { label: c.currency, value: c.currency }
                }),
              ]}
            />
          </div>

          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledTextValidatedField
              type="number"
              min="0"
              name="minSalary"
              label="Minimum Salary"
              placeholder="Minimum salary for this job"
              testid="jobMinSalary"
            />
          </div>

          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledTextValidatedField
              type="number"
              min="0"
              name="maxSalary"
              label="Maximum Salary"
              placeholder="Maximum salary for this job"
              testid="jobMaxSalary"
            />
          </div>

          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="salaryType"
              label="Salary Type"
              placeholder="Hourly, Weekly, etc."
              testid="salaryType"
              defaultValue={Object.keys(SalaryType).find((type) => type === SalaryType.YEAR)}
              options={Object.keys(SalaryType).map((salaryType) => {
                const type = getSalaryIntervalFromSalaryType(salaryType)
                return { label: type, value: salaryType }
              })}
            />
          </div>

          <div className="w-full md:w-1/3 lg:w-1/3">
            <CheckboxField name="showSalary" label="Show salary on careers page" />
          </div>
        </div>

        <div
          className={`${
            step === steps[3] ? "flex" : "hidden"
          } flex-col space-y-6 w-full items-center`}
        >
          <div className="w-full md:w-1/3 lg:w-1/3">
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
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledReactSelectField
              name="employmentType"
              label="Employment Type"
              placeholder="Full Time, Part Time, etc."
              testid="employmentType"
              //   isMulti={true}
              options={Object.keys(EmploymentType).map((employmentType) => {
                return {
                  label: titleCase(employmentType.replaceAll("_", " ")),
                  value: employmentType,
                }
              })}
              defaultValue={[
                Object.keys(EmploymentType).find(
                  (employmentType) => employmentType === "FULL_TIME"
                ),
              ]}
            />
          </div>
          <div className="w-full md:w-1/3 lg:w-1/3">
            <LabeledTextValidatedField
              type="date"
              name="validThrough"
              label="Valid Through"
              testid="jobValidThrough"
            />
          </div>
        </div>
      </Form>
    </Suspense>
  )
}

export default JobForm
