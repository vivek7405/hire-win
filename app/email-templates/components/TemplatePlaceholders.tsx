import { EditorState, Modifier } from "draft-js"
import { useState } from "react"
import { EmailTemplatePlaceholders } from "types"

const TemplatePlaceholders = ({ editorState, onChange }) => {
  const [open, setOpen] = useState(false)

  const addPlaceholder = (placeholder) => {
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      placeholder,
      editorState.getCurrentInlineStyle()
    )
    onChange(EditorState.push(editorState, contentState, "insert-characters"))
  }

  // const placeholderOptions = [
  //   { key: "firstName", value: "{{firstName}}", text: "First Name" },
  //   { key: "lastName", value: "{{lastName}}", text: "Last name" },
  //   { key: "company", value: "{{company}}", text: "Company" },
  //   { key: "address", value: "{{address}}", text: "Address" },
  //   { key: "zip", value: "{{zip}}", text: "Zip" },
  //   { key: "city", value: "{{city}}", text: "City" },
  // ]

  const listItem = Object.keys(EmailTemplatePlaceholders).map((item) => (
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
            {listItem}
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

export default TemplatePlaceholders
