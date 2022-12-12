import { z } from "zod"

export const BlogPostObj = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  excerpt: z.string().optional(),
  keywords: z.string().array().optional(),
  content: z.string().optional(),
})

export type BlogPostInputType = z.infer<typeof BlogPostObj>
