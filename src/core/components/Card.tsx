import React from "react"
import * as Dialog from "@radix-ui/react-dialog"

type CardProps = {
  children: React.ReactNode
  isFull?: boolean
  title?: string
  description?: string
  noMarginY?: boolean
  onClick?: any
}

export const Card = ({ children, isFull, title, description, noMarginY, onClick }: CardProps) => {
  return (
    <>
      <div
        onClick={onClick}
        className={`${noMarginY ? "my-0" : "my-2"} ${
          onClick ? "cursor-pointer" : "cursor-default"
        } md:mx-2 lg:mx-2 w-full ${isFull ? "!mx-0 md:w-full lg:w-full" : "md:w-60 lg:w-60"}`}
      >
        <div className="inline-block whitespace-normal w-full">
          <div className={`box-border w-full rounded-lg bg-white border border-neutral-300 p-2.5`}>
            {title && description ? (
              <div>
                <span>
                  <div
                    // className='react-kanban-card__title'
                    className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between"
                  >
                    <span>{title}</span>
                  </div>
                </span>
                <div
                  // className='react-kanban-card__description'
                  className="pt-2.5 overflow-auto"
                >
                  {description}
                </div>
              </div>
            ) : (
              <div>{children}</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Card
