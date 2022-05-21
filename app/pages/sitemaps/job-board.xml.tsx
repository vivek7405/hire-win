import { GetServerSidePropsContext, invokeWithMiddleware } from "blitz"
import path from "path"
import getAllUsersWOPagination from "app/users/queries/getAllUsersWOPagination"
import getCompany from "app/companies/queries/getCompany"
import getAllCompanies from "app/companies/queries/getAllCompanies"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  const companies = await invokeWithMiddleware(getAllCompanies, undefined, { ...context })

  const res = context.res
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${companies
        .map(({ name, updatedAt }) => {
          return `
              <url>
                <loc>${baseUrl}/${name}</loc>
                <lastmod>${updatedAt}</lastmod>
                <changefreq>always</changefreq>
                <priority>1.0</priority>
              </url>
            `
        })
        .join("")}
    </urlset>
  `

  res.setHeader("Content-Type", "text/xml")
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

const SiteMap = () => {}

export default SiteMap
