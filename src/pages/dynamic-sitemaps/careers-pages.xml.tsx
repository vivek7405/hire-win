import { Routes } from "@blitzjs/next"
import type { GetServerSidePropsContext } from "next/types"
import { getAllBlogPosts } from "src/blog/utils/getAllBlogPosts"
import path from "path"
import { gSSP } from "src/blitz-server"
import getAllCompanySlugs from "src/companies/queries/getAllCompanySlugs"

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  if (res) {
    const companies = await getAllCompanySlugs()

    const baseURL =
      process.env.NODE_ENV === "production" ? `https://hire.win` : `http://localhost:3000`

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseURL}/</loc>
        <priority>1.0</priority>
        <changefreq>monthly</changefreq>
    </url>
    ${companies
      .map(
        ({ slug }) => `<url>
      <loc>${baseURL}/${slug}/</loc>
      <priority>0.8</priority>
      <changefreq>weekly</changefreq>
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

const DynamicCareersPagesSiteMap: React.FC = () => null
export default DynamicCareersPagesSiteMap
