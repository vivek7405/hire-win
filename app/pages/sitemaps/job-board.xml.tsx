import { GetServerSidePropsContext, invokeWithMiddleware } from "blitz"
import path from "path"
import getAllUsersWOPagination from "app/users/queries/getAllUsersWOPagination"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  const users = await invokeWithMiddleware(getAllUsersWOPagination, undefined, { ...context })

  const res = context.res
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${users
        .map(({ companyName, updatedAt }) => {
          return `
              <url>
                <loc>${baseUrl}/${companyName}</loc>
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
