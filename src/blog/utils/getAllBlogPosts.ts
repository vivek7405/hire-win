import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { BlogPostInputType } from "../validations"
import moment from "moment"

const postsDirectory = path.join(process.cwd(), "src/blog/posts")

export function getAllBlogPosts() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get slug
    const slug = fileName.replace(/\.md$/, "")

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, "utf8")

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the slug
    return {
      slug,
      title: matterResult.data.title,
      date: matterResult.data.date,
      image: matterResult.data.image,
      excerpt: matterResult.data.excerpt,
      keywords: matterResult.data.keywords,
      ...matterResult.data,
    } as BlogPostInputType
  })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date && b.date && moment(a.date).diff(b.date) < 0) {
      return 1
    } else {
      return -1
    }
  })
}
