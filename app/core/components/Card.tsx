import React from "react"
import * as Dialog from "@radix-ui/react-dialog"

type CardProps = {
  children: React.ReactNode
  isFull?: boolean
  title?: string
  description?: string
}

export const Card = ({ children, isFull, title, description }: CardProps) => {
  return (
    <>
      <div
        className={`my-2 md:mx-2 lg:mx-2 w-full ${
          isFull ? "!mx-0 md:w-full lg:w-full" : "md:w-60 lg:w-60"
        }`}
      >
        <div className="inline-block whitespace-normal w-full">
          <div className={`box-border w-full rounded bg-white border-2 border-gray-200 p-2.5`}>
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
