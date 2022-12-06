export default function getScoreAverage(scoreRatings: number[]) {
  return scoreRatings.reduce((a, b) => a + b, 0) / scoreRatings.length
}
