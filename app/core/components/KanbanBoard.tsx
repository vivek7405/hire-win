import { useRouter } from "blitz"
import "regenerator-runtime/runtime"
import Debouncer from "app/core/utils/debouncer"
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
import { forwardRef } from "react"

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
  resultName?: string
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
  resultName,
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

  return (
    <div>
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            // className='react-kanban-board'
            className="overflow-y-hidden flex items-start p-1"
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
                          // className='react-kanban-column'
                          className="p-4 bg-neutral-100 border-2 border-gray-300 rounded m-2 focus:outline-none h-full inline-block align-top"
                        >
                          <div {...columnProvided.dragHandleProps}>
                            <h1
                              // className="react-kanban-column-header"
                              className="pb-2.5 font-bold focus:outline-none"
                            >
                              {column.title}
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
                                            // className={`react-kanban-card ${isDragging ? 'react-kanban-card--dragging' : ''}`}
                                            className={`box-border w-60 rounded bg-white border-2 border-gray-200 p-2.5 mb-2 ${
                                              isDragging ? "shadow-md" : ""
                                            }`}
                                          >
                                            {!card.renderContent ? (
                                              <div>
                                                <span>
                                                  <div
                                                    // className='react-kanban-card__title'
                                                    className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between"
                                                  >
                                                    <span>{card.title}</span>
                                                  </div>
                                                </span>
                                                <div
                                                  // className='react-kanban-card__description'
                                                  className="pt-2.5"
                                                >
                                                  {card.description}
                                                </div>
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
                              <div
                                // className='react-kanban-card-skeleton'
                                className="box-border w-60"
                              />
                            )}
                          </DroppableColumn>
                        </div>
                      )
                    }}
                  </Draggable>
                )
              })}
            </DroppableBoard>
            {/* {renderColumnAdder()} */}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

export default KanbanBoard
