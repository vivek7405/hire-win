import * as React from "react"

export const useIsOverflow = (ref: any, callback: any = null, isHorizontal: boolean = false) => {
  const [isOverflow, setIsOverflow] = React.useState(undefined as boolean | undefined)

  React.useLayoutEffect(() => {
    const { current } = ref

    const trigger = () => {
      let hasOverflow = current.scrollHeight > current.clientHeight
      if (isHorizontal) {
        hasOverflow = current.scrollWidth > current.clientWidth
      }
      setIsOverflow(hasOverflow)
      if (callback) callback(hasOverflow)
    }

    if (current) {
      if ("ResizeObserver" in window) {
        new ResizeObserver(trigger).observe(current)
      }
      trigger()
    }
  }, [callback, ref])

  return isOverflow
}
