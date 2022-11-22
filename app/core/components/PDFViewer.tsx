import { ArrowLeftIcon, ArrowRightIcon, ZoomInIcon, ZoomOutIcon } from "@heroicons/react/outline"
import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { SizeMe } from "react-sizeme"

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

  const [scale, setScale] = useState(1)
  const zoomSize = 0.5

  return (
    <>
      <div className="w-full flex flex-col items-center space-y-2">
        <div className="w-full flex justify-between items-center px-4">
          <button
            className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={scale === 1}
            onClick={() => {
              scale > 1 && setScale(scale - zoomSize)
            }}
          >
            <ZoomOutIcon className="w-5 h-5" />
          </button>

          <div className="flex space-x-2 justify-center items-center">
            <button
              className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={pageNumber === 1}
              onClick={() => {
                pageNumber > 1 && setPageNumber(pageNumber - 1)
              }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <button
              className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={numPages !== null && pageNumber === numPages}
              onClick={() => {
                numPages !== null && pageNumber < numPages && setPageNumber(pageNumber + 1)
              }}
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={scale >= 2}
            onClick={() => {
              setScale(scale + zoomSize)
            }}
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full flex justify-center">
          <div className="overflow-auto w-full">
            <SizeMe refreshMode="debounce" noPlaceholder={true}>
              {({ size }) => {
                console.log(size)
                return (
                  <Document
                    file={props.fileURL ? { url: props.fileURL } : props.file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    noData="File not available"
                    loading={<div className="w-full text-center">Loading...</div>}
                  >
                    <Page
                      width={size.width ? size.width : 1}
                      scale={scale}
                      pageNumber={pageNumber}
                    />
                  </Document>
                )
              }}
            </SizeMe>
          </div>
        </div>
      </div>
    </>
  )
}

export default PDFViewer
