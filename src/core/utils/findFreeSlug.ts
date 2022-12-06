export async function findFreeSlug(prefix, fetchResults, maxAttempts = 10) {
  for (let i = 1; i < maxAttempts; i++) {
    const slug = i > 1 ? `${prefix}-${i}` : prefix
    const result = await fetchResults(slug)

    if (!result) {
      return slug
    }
  }
  throw new Error(`Could not find a free slug for ${prefix} after ${maxAttempts} attempts`)
}
