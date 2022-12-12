import fs from "fs"
import { Routes } from "@blitzjs/next"
// import RSS from "rss"
import { Feed } from "feed"
import { getAllBlogPosts } from "./getAllBlogPosts"

export default async function generateRssFeed() {
  const site_url = process.env.NEXT_PUBLIC_APP_URL || "https://hire.win"

  const allPosts = await getAllBlogPosts()

  const feedOptions = {
    title: "Hire.win Blog | RSS Feed",
    description: "Don't just hire, Hire better!",
    id: `${site_url}/blog`,
    link: `${site_url}/blog`,
    favicon: `${site_url}/favicon.ico`,
    // image: `${site_url}/logo.png`,
    copyright: `Copyright ©${new Date().getFullYear()} hire.win - All rights reserved`,
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${site_url}/blog/rss.xml`,
      json: `${site_url}/blog/rss.json`,
      atom: `${site_url}/blog/atom.xml`,
    },
  }

  const feed = new Feed(feedOptions)

  allPosts.forEach((post) => {
    feed.addItem({
      title: post.title || "",
      id: `${site_url}/blog/${post.slug}`,
      link: `${site_url}/blog/${post.slug}`,
      image: post.image,
      description: post.excerpt,
      date: new Date(post.date || ""),
    })
  })

  fs.writeFileSync("./public/blog/rss.xml", feed.rss2())
  fs.writeFileSync("./public/blog/rss.json", feed.json1())
  fs.writeFileSync("./public/blog/atom.xml", feed.atom1())
}
