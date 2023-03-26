import { useRouter } from "next/router";
import "regenerator-runtime/runtime"
import Debouncer from "src/core/utils/debouncer"
import Pagination from "./Pagination"

import {
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DraggableProvidedDragHandleProps,
  DragDropContext,
} from "react-beautiful-dnd"
import { forwardRef } from "react"
import { CardType, DragDirection } from "types"

type CardsProps = {
  droppableName: string
  cards: CardType[]
  setCards: any
  mutateCardDropDB: any
  isDragDisabled?: boolean
  direction?: DragDirection
  isFull?: boolean

  noSearch?: boolean

  paginationBottom?: boolean
  pageIndex?: any
  hasNext?: any
  hasPrevious?: any
  totalCount?: any
  startPage?: any
  endPage?: any
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

// const Columns = forwardRef((props, ref) => (
//   <div ref={ref as any} style={{ whiteSpace: "nowrap" }} {...props} />
// ))
// const DroppableBoard = withDroppable(Columns)

const Cards = ({
  droppableName,
  cards,
  setCards,
  mutateCardDropDB,
  isDragDisabled,
  direction,
  isFull,

  noSearch,

  paginationBottom,
  pageIndex: controlledPageIndex,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
  noMarginRight,
  noPagination,
  resultName,
}: CardsProps) => {
  const router = useRouter()

  const ColumnEmptyPlaceholder = forwardRef((props, ref) => (
    <div
      ref={ref as any}
      className={
        direction === DragDirection.HORIZONTAL
          ? "flex flex-wrap justify-center"
          : "flex flex-col justify-center items-center"
      }
      {...props}
    />
  ))
  const DroppableColumn = withDroppable(ColumnEmptyPlaceholder)

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

    const card = cards?.find((card) => card.id === draggableId)

    if (card) {
      cards?.splice(source?.index, 1)
      cards?.splice(destination?.index, 0, card)
    }

    setCards([...cards])
    mutateCardDropDB(source, destination, draggableId)
  }

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

      {/* {noPagination && <br />} */}

      {!noPagination && !paginationBottom && (
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
          {/* <DroppableBoard droppableId="board-droppable" direction="horizontal" type="BOARD"> */}
          {/* <div className="overflow-y-hidden flex"> */}
          <DroppableColumn key={droppableName} droppableId={droppableName} direction={direction}>
            {cards.length ? (
              cards.map((card, index) => (
                <Draggable
                  key={card.id}
                  draggableId={card.id}
                  index={index}
                  isDragDisabled={card.isDragDisabled || isDragDisabled}
                >
                  {(provided, { isDragging }) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`my-2 md:mx-2 lg:mx-2 w-full ${
                          isFull ? "!mx-0 md:w-full lg:w-full" : "md:w-60 lg:w-60"
                        }`}
                      >
                        <div className="inline-block whitespace-normal w-full">
                          <div
                            className={`box-border w-full rounded bg-white border border-gray-300 p-2.5 ${
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
                                  className="pt-2.5 overflow-auto"
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
              <div className={`box-border ${isFull ? "w-full" : "w-60"}`} />
            )}
          </DroppableColumn>
          {/* </div> */}
          {/* </DroppableBoard> */}
          {/* {renderColumnAdder()} */}
        </DragDropContext>
      </div>

      {!noPagination && paginationBottom && (
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
    </div>
  )
}

export default Cards
