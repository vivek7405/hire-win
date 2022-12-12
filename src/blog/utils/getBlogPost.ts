import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { BlogPostInputType } from "../validations"

const postsDirectory = path.join(process.cwd(), "src/blog/posts")

export function getBlogPost(slug) {
  // Read markdown file as string
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Combine the data with the id
  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    image: matterResult.data.image,
    excerpt: matterResult.data.excerpt,
    keywords: matterResult.data.keywords,
    content: matterResult.content,
    ...matterResult.data,
  } as BlogPostInputType
}
