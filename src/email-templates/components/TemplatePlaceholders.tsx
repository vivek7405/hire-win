import { useSession } from "@blitzjs/auth"
import { useQuery } from "@blitzjs/rpc"
import { EditorState, Modifier } from "draft-js"
import { Suspense, useEffect, useState } from "react"
import getCompany from "src/companies/queries/getCompany"
import { EmailTemplatePlaceholders } from "types"

const TemplatePlaceholdersComponent = ({ editorState, onChange }) => {
  const [open, setOpen] = useState(false)
  const session = useSession()
  const [company] = useQuery(getCompany, { where: { id: session.companyId || "0" } })

  const addPlaceholder = (placeholder) => {
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      placeholder,
      editorState.getCurrentInlineStyle()
    )
    onChange(EditorState.push(editorState, contentState, "insert-characters"))
  }

  const isParent = company?.parentCompany?.name ? true : false
  const companyPlaceholderItems = Object.keys(EmailTemplatePlaceholders)?.filter(
    (placeholder) =>
      placeholder !== EmailTemplatePlaceholders.Parent_Company_Name &&
      placeholder !== EmailTemplatePlaceholders.Job_Board_Link
  )
  const parentCompanyPlaceholderItems = Object.keys(EmailTemplatePlaceholders)
  const placeholderItems = isParent ? parentCompanyPlaceholderItems : companyPlaceholderItems

  const listItems = placeholderItems.map((item) => (
    <li
      onClick={(e) => {
        e.preventDefault()
        addPlaceholder(`{{${item}}}`)
      }}
      key={item}
      className="rdw-dropdownoption-default placeholder-li"
    >
      {item.replaceAll("_", " ")}
    </li>
  ))

  return (
    <>
      <div
        onClick={() => {
          setOpen(!open)
        }}
        className="rdw-block-wrapper"
        aria-label="rdw-block-control"
      >
        <div className="rdw-dropdown-wrapper rdw-block-dropdown" aria-label="rdw-dropdown">
          <div className="rdw-dropdown-selectedtext" title="Placeholders">
            <span>Placeholder</span>
            <div className={`rdw-dropdown-caretto${open ? "close" : "open"}`}></div>
          </div>
          <ul
            className={`rdw-dropdown-optionwrapper whitespace-nowrap ${
              open ? "" : "placeholder-ul"
            }`}
          >
            {listItems}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .placeholder-ul {
          visibility: hidden;
        }
        .placeholder-li:hover {
          background: #f1f1f1;
        }
        .rdw-dropdown-optionwrapper {
          width: fit-content;
        }
      `}</style>
    </>
  )
}

const TemplatePlaceholders = ({ editorState, onChange }) => {
  return (
    <Suspense fallback="Loading...">
      <TemplatePlaceholdersComponent editorState={editorState} onChange={onChange} />
    </Suspense>
  )
}

export default TemplatePlaceholders
