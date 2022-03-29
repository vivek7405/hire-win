// Returns an array of numbers from start to stop with an increment of step
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)

export default range
