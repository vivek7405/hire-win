import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Job } from "app/jobs/validations"

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import dynamic from "next/dynamic"
import { EditorState, ContentState, convertToRaw, convertFromRaw } from "draft-js"
import { useState } from "react"

// import { convertToHTML } from 'draft-convert';
// import DOMPurify from 'dompurify';

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const JobForm = (props: JobFormProps) => {
  const Editor = dynamic(
    () => {
      return import("react-draft-wysiwyg").then((mod) => mod.Editor)
    },
    { ssr: false }
  ) as any

  const content = {
    blocks: [
      {
        key: "637gr",
        text: "Hello",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [{ offset: 0, length: 5, style: "BOLD" }],
        entityRanges: [],
        data: {},
      },
      {
        key: "5c692",
        text: "Trying to save and retrieve.",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [{ offset: 10, length: 5, style: "ITALIC" }],
        entityRanges: [],
        data: {},
      },
      {
        key: "9uav2",
        text: "Let's see if this works!",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [{ offset: 0, length: 24, style: "CODE" }],
        entityRanges: [],
        data: {},
      },
      {
        key: "4debf",
        text: "",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "7cgqg",
        text: "Is this working fine?",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "35gd2",
        text: "Does it work flawlessly?",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "6bsep",
        text: "",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "f0d16",
        text: "It seems to be working fine!!",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "92hk1",
        text: "This is in red color!",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [{ offset: 0, length: 21, style: "color-rgb(226,80,65)" }],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  }
  const contentState = convertFromRaw(content)
  const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState))
  // const [editorState, setEditorState] = useState(EditorState.createEmpty())
  // const [convertedContent, setConvertedContent] = useState(<div></div>)

  // const convertContentToHTML = () => {
  //   let currentContentAsHTML = convertToHTML(editorState.getCurrentContent());
  //   setConvertedContent(currentContentAsHTML);
  // }
  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState)
    // convertContentToHTML()
  }

  return (
    <>
      <Form
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
          name="name"
          label="Name"
          placeholder="Job Name"
          testid="jobName"
        />
        <Editor
          editorState={editorState}
          wrapperClassName="rich-editor demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={onEditorStateChange}
          placeholder="The message goes here..."
        />

        <br />
        <br />
        <b>Output:</b>
        {/* <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(draftToHtml(convertToRaw(editorState.getCurrentContent()))) }}></span>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(convertedContent) }}></div> */}
        <Editor
          wrapperStyle={{ margin: "0" }}
          editorState={EditorState.createWithContent(editorState.getCurrentContent())}
          toolbarHidden
          readOnly
        />
      </Form>
      <button onClick={() => alert(JSON.stringify(convertToRaw(editorState.getCurrentContent())))}>
        Display
      </button>
    </>
  )
}

export default JobForm
