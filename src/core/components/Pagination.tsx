import { useRouter } from "next/router"
import { useTable, useFilters, useGlobalFilter, usePagination } from "react-table"
import "regenerator-runtime/runtime"
import Debouncer from "src/core/utils/debouncer"

type PaginationProps = {
  pageIndex: number
  hasNext: boolean
  hasPrevious: boolean
  totalCount: number
  startPage: number
  endPage: number
  queryPageName?: string
  resultName?: string
  hideIfSinglePage?: boolean
}
const Pagination = ({
  pageIndex: controlledPageIndex,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
  queryPageName,
  resultName,
  hideIfSinglePage,
}: PaginationProps) => {
  const router = useRouter()

  const goToPreviousPage = () => {
    const query = {
      ...router.query,
    }
    try {
      if (queryPageName) {
        eval(`query.${queryPageName} = ${controlledPageIndex - 1}`)
      } else {
        eval(`query.page = ${controlledPageIndex - 1}`)
      }
    } catch {}
    router.push({
      query,
    })
  }

  const goToNextPage = () => {
    const query = {
      ...router.query,
    }
    try {
      if (queryPageName) {
        eval(`query.${queryPageName} = ${controlledPageIndex + 1}`)
      } else {
        eval(`query.page = ${controlledPageIndex + 1}`)
      }
    } catch {}
    router.push({
      query,
    })
  }

  return (hideIfSinglePage ? controlledHasPrevious || controlledHasNext : true) ? (
    <nav className="flex items-center justify-between py-6" aria-label="Pagination">
      <div>
        <p className="text-gray-700">
          {totalCount > 0 && (controlledHasPrevious || controlledHasNext) && (
            <>
              Showing <span className="font-medium">{startPage}</span> to{" "}
              <span className="font-medium">{endPage}</span> of{" "}
            </>
          )}
          <span className="font-medium">{totalCount === 0 ? "No" : totalCount}</span>{" "}
          {(resultName && resultName[resultName.length - 1] === "y"
            ? totalCount !== 1
              ? resultName.substring(0, resultName.length - 1)
              : resultName
            : resultName) || "result"}
          {totalCount !== 1 &&
            (resultName && resultName[resultName.length - 1] === "y" ? "ies" : "s")}
        </p>
      </div>
      {totalCount > 0 && (controlledHasPrevious || controlledHasNext) && (
        <div className="flex-1 flex justify-end">
          <button
            className={`${
              !controlledHasPrevious && "disabled:opacity-50 cursor-not-allowed"
            } text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700`}
            disabled={!controlledHasPrevious}
            onClick={() => goToPreviousPage()}
          >
            Previous
          </button>
          <button
            className={`${
              !controlledHasNext && "disabled:opacity-50 cursor-not-allowed"
            } ml-3 text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700`}
            disabled={!controlledHasNext}
            onClick={() => goToNextPage()}
          >
            Next
          </button>
        </div>
      )}
    </nav>
  ) : (
    <></>
  )
}

export default Pagination
