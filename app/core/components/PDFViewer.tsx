import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type PDFViewerProps = {
  fileURL?: string
  file?: any
}
const PDFViewer = (props: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(null as any)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="flex space-x-2">
        <button
          disabled={pageNumber === 1}
          onClick={() => {
            pageNumber > 1 && setPageNumber(pageNumber - 1)
          }}
        >
          Previous
        </button>
        <p>
          {pageNumber} of {numPages}
        </p>
        <button
          disabled={numPages !== null && pageNumber === numPages}
          onClick={() => {
            numPages !== null && pageNumber < numPages && setPageNumber(pageNumber + 1)
          }}
        >
          Next
        </button>
      </div>
      <div className="flex justify-center">
        <Document
          file={props.fileURL ? { url: props.fileURL } : props.file}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page width="750" pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer
