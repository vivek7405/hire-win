import { useRouter } from "blitz"
import { useTable, useFilters, useGlobalFilter, usePagination } from "react-table"
import "regenerator-runtime/runtime"
import Debouncer from "app/core/utils/debouncer"

const Pagination = ({
  pageIndex: controlledPageIndex,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
}) => {
  const router = useRouter()

  const goToPreviousPage = () => {
    router.push({
      query: {
        ...router.query,
        page: controlledPageIndex - 1,
      },
    })
  }

  const goToNextPage = () => {
    router.push({
      query: {
        ...router.query,
        page: controlledPageIndex + 1,
      },
    })
  }

  return (
    <nav className="flex items-center justify-between py-6" aria-label="Pagination">
      <div>
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startPage}</span> to{" "}
          <span className="font-medium">{endPage}</span> of{" "}
          <span className="font-medium">{totalCount}</span> results
        </p>
      </div>
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
    </nav>
  )
}

export default Pagination
