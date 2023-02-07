import { Routes } from "@blitzjs/next"
import type { GetServerSidePropsContext } from "next/types"
import { getAllBlogPosts } from "src/blog/utils/getAllBlogPosts"

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  if (res) {
    const allPostsData = getAllBlogPosts()
    const baseURL =
      process.env.NODE_ENV === "production"
        ? `https://hire.win${Routes.Blog().pathname}`
        : `http://localhost:3000${Routes.Blog().pathname}`

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseURL}/</loc>
        <priority>1.0</priority>
        <changefreq>weekly</changefreq>
    </url>
    ${allPostsData
      .map(
        ({ slug, date }) => `<url>
      <loc>${baseURL}/${slug}/</loc>
      <priority>0.9</priority>
      <changefreq>monthly</changefreq>
      </url>`
      )
      .join("\n")}
    </urlset>`

    res.setHeader("Content-Type", "text/xml")
    res.write(sitemap)
    res.end()
  }

  return { props: {} }
}

const DynamicBlogSitemap: React.FC = () => null
export default DynamicBlogSitemap
