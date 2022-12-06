// Generate a random integer between min and max with min and max included
const randInt = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default randInt
