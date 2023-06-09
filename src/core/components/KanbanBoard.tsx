import { useRouter } from "next/router"
import "regenerator-runtime/runtime"
import Debouncer from "src/core/utils/debouncer"
import Pagination from "./Pagination"
import { KanbanBoardType } from "types"

import {
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DraggableProvidedDragHandleProps,
  DragDropContext,
} from "react-beautiful-dnd"
import { forwardRef, useEffect, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline"
import { useIsOverflow } from "../hooks/useIsOverflow"

type KanbanBoardProps = {
  board: KanbanBoardType
  setBoard: any
  mutateCardDropDB: any
  allowColumnDrag?: boolean

  pageIndex: any
  hasNext: any
  hasPrevious: any
  totalCount: any
  startPage: any
  endPage: any
  noMarginRight?: boolean
  noPagination?: boolean
  noSearch?: boolean
  resultName?: string
  showCount?: boolean
}

function pickPropOut(object, prop) {
  return Object.keys(object).reduce((obj, key) => {
    return key === prop ? obj : { ...obj, [key]: object[key] }
  }, {})
}

function withDroppable(Component) {
  return function WrapperComponent({ children, ...droppableProps }) {
    return (
      <Droppable {...droppableProps}>
        {(provided) => (
          <Component ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </Component>
        )}
      </Droppable>
    )
  }
}

const ColumnEmptyPlaceholder = forwardRef((props, ref) => (
  <div ref={ref as any} style={{ minHeight: "inherit", height: "inherit" }} {...props} />
))
const DroppableColumn = withDroppable(ColumnEmptyPlaceholder)

const Columns = forwardRef((props, ref) => (
  <div ref={ref as any} style={{ whiteSpace: "nowrap" }} {...props} />
))
const DroppableBoard = withDroppable(Columns)

const KanbanBoard = ({
  board,
  setBoard,
  mutateCardDropDB,
  allowColumnDrag,

  pageIndex: controlledPageIndex,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
  noMarginRight,
  noPagination,
  noSearch,
  resultName,
  showCount,
}: KanbanBoardProps) => {
  const router = useRouter()

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

  const onDragEnd = (event) => {
    const { source, destination, draggableId } = event
    if (!(source && destination)) return

    const col = board?.columns?.find((col) => col.id === draggableId)
    if (col) {
      board?.columns.splice(source.index, 1)
      board.columns.splice(destination.index, 1, col)
    } else {
      const srcCol = board?.columns?.find((col) => col.id === source?.droppableId)
      const destCol = board?.columns?.find((col) => col.id === destination?.droppableId)

      const card = srcCol?.cards?.find((card) => card.id === draggableId)

      if (card) {
        srcCol?.cards?.splice(source?.index, 1)
        destCol?.cards?.splice(destination?.index, 0, card)
      }
    }

    setBoard({ ...board })
    if (!col) mutateCardDropDB(source, destination, draggableId)
  }

  const scrollRef = useRef(null as any)

  const isDivOverflowInitial = useIsOverflow(
    scrollRef,
    (isOverflow) => {
      setIsDivOverflow(isOverflow)
    },
    true
  )
  const [isDivOverflow, setIsDivOverflow] = useState(isDivOverflowInitial as boolean | undefined)

  const [scrollX, setScrollX] = useState(0) // For detecting start scroll postion
  const [scrollEnd, setScrollEnd] = useState(false) // For detecting end of scrolling

  const scrollDiv = (scrollOffset) => {
    scrollRef.current.scrollLeft += scrollOffset

    setScrollX(scrollX + scrollOffset) // Updates the latest scrolled postion

    //For checking if the scroll has ended
    if (
      Math.floor(scrollRef.current.scrollWidth - scrollRef.current.scrollLeft) <=
      scrollRef.current.offsetWidth
    ) {
      setScrollEnd(true)
    } else {
      setScrollEnd(false)
    }
  }

  const scrollCheck = () => {
    setScrollX(scrollRef.current.scrollLeft)
    if (
      Math.floor(scrollRef.current.scrollWidth - scrollRef.current.scrollLeft) <=
      scrollRef.current.offsetWidth
    ) {
      setScrollEnd(true)
    } else {
      setScrollEnd(false)
    }
  }

  useEffect(() => {
    //Check width of the scrollings
    if (scrollRef.current && scrollRef?.current?.scrollWidth === scrollRef?.current?.offsetWidth) {
      setScrollEnd(true)
    } else {
      setScrollEnd(false)
    }
    return () => {}
  }, [scrollRef?.current?.scrollWidth, scrollRef?.current?.offsetWidth])

  return (
    <div>
      {!noSearch && (
        <div className="flex mb-2">
          <input
            placeholder="Search"
            type="text"
            defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
            className={`border border-gray-300 ${
              !noMarginRight && `mr-2`
            } lg:w-1/4 px-2 py-2 w-full rounded`}
            onChange={(e) => {
              execDebouncer(e)
            }}
          />
        </div>
      )}

      {!noPagination && (
        <Pagination
          endPage={endPage}
          hasNext={controlledHasNext}
          hasPrevious={controlledHasPrevious}
          pageIndex={controlledPageIndex}
          startPage={startPage}
          totalCount={totalCount}
          resultName={resultName}
        />
      )}

      <div>
        <div className="w-full hidden sm:flex items-center justify-between">
          {isDivOverflow && (
            <button
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={scrollX <= 0}
              onClick={() => {
                scrollDiv(-200)
              }}
            >
              <ChevronLeftIcon className="w-6 h-6 bg-black text-white" />
            </button>
          )}
          {isDivOverflow && (
            <button
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={scrollEnd}
              onClick={() => {
                scrollDiv(200)
              }}
            >
              <ChevronRightIcon className="w-6 h-6 bg-black text-white" />
            </button>
          )}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            ref={scrollRef}
            onScroll={scrollCheck}
            className="overflow-y-hidden flex items-start py-1"
          >
            <DroppableBoard droppableId="board-droppable" direction="horizontal" type="BOARD">
              {board?.columns?.map((column, index) => {
                return (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={index}
                    isDragDisabled={!allowColumnDrag}
                  >
                    {(columnProvided) => {
                      const draggablePropsWithoutStyle = pickPropOut(
                        columnProvided.draggableProps,
                        "style"
                      )

                      return (
                        <div
                          ref={columnProvided.innerRef}
                          {...draggablePropsWithoutStyle}
                          style={{
                            minHeight: "28px",
                            ...columnProvided.draggableProps.style,
                          }}
                          className="p-4 bg-white border border-neutral-400 rounded-lg m-2 focus:outline-none h-full inline-block align-top"
                        >
                          <div {...columnProvided.dragHandleProps}>
                            <h1 className="pb-2.5 font-semibold focus:outline-none">
                              {column.title?.length > 25
                                ? `${column.title?.substring(0, 25)}...`
                                : column.title}
                              {showCount && `${" "}(${column.cards.length})`}
                            </h1>
                          </div>
                          <DroppableColumn key={column.id} droppableId={column.id}>
                            {column.cards.length ? (
                              column.cards.map((card, index) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                  isDragDisabled={card.isDragDisabled}
                                >
                                  {(provided, { isDragging }) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div className="inline-block whitespace-normal">
                                          <div
                                            className={`box-border w-60 rounded bg-white border border-gray-300 p-2.5 mb-2 ${
                                              isDragging ? "shadow-md" : ""
                                            }`}
                                          >
                                            {!card.renderContent ? (
                                              <div>
                                                <span>
                                                  <div className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between">
                                                    <span>{card.title}</span>
                                                  </div>
                                                </span>
                                                <div className="pt-2.5">{card.description}</div>
                                              </div>
                                            ) : (
                                              <div>{card.renderContent}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  }}
                                </Draggable>
                              ))
                            ) : (
                              <div className="box-border w-60" />
                            )}
                          </DroppableColumn>
                        </div>
                      )
                    }}
                  </Draggable>
                )
              })}
            </DroppableBoard>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

export default KanbanBoard
