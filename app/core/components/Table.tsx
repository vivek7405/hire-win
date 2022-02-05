import { useRouter } from "blitz"
import { useTable, useFilters, useGlobalFilter, usePagination } from "react-table"
import "regenerator-runtime/runtime"
import Debouncer from "app/core/utils/debouncer"
import Pagination from "./Pagination"

const Table = ({
  columns,
  data,
  pageCount: controlledPageCount,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
}) => {
  const router = useRouter()
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: controlledPageCount,
      pageIndex: controlledPageIndex,
      pageSize: controlledPageSize,
    },
    useFilters,
    useGlobalFilter,
    usePagination
  )

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
        page: 0,
        ...searchQuery,
      },
    })
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e) => {
    e.persist()
    return debouncer.execute(e)
  }

  return (
    <div>
      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          className="border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded"
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      <div className="flex flex-col overflow-auto">
        <table className="table min-w-full border border-gray-200" {...getTableProps()}>
          <thead className="border-b border-gray-200">
            {headerGroups.map((headerGroup, i) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={i}>
                {headerGroup.headers.map((column, i) => (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    {...column.getHeaderProps()}
                    key={i}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr className="bg-white" {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, i) => {
                    return (
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                        {...cell.getCellProps()}
                        key={i}
                      >
                        {cell.render("Cell")}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        endPage={endPage}
        hasNext={controlledHasNext}
        hasPrevious={controlledHasPrevious}
        pageIndex={controlledPageIndex}
        startPage={startPage}
        totalCount={totalCount}
      />
    </div>
  )
}

export default Table
