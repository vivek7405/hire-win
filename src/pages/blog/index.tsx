import { Routes } from "@blitzjs/next"
import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import generateRssFeed from "src/blog/utils/generateRSSFeed"
import { getAllBlogPosts } from "src/blog/utils/getAllBlogPosts"
import LandingLayout from "src/core/layouts/LandingLayout"

export async function getStaticProps() {
  await generateRssFeed()
  const allPostsData = getAllBlogPosts()
  return {
    props: {
      allPostsData,
    },
  }
}

export default function Blog({ allPostsData }) {
  return (
    <LandingLayout title="Hire.win | Blog">
      <section className="px-4">
        <div className="w-full h-full flex justify-center">
          <h1 className="font-bold text-5xl text-center">Don't just hire, Hire better!</h1>
        </div>
        <div className="mt-10 w-full h-full flex items-center justify-center">
          <ul className="w-full sm:w-5/6 lg:w-3/4 xl:w-2/3 grid grid-col-1 md:grid-cols-2 gap-10">
            {allPostsData.map(({ slug, date, image, title, excerpt }) => (
              <Link href={Routes.BlogPost({ slug })} legacyBehavior>
                <a className="w-full h-full">
                  <li className="w-full h-full bg-white border-8 border-white rounded-lg hover:shadow-xl cursor-pointer">
                    {image && <img className="w-full rounded-t" src={image} />}
                    <div className="p-5">
                      <p className="text-sm italic">
                        {moment(date, "DD-MM-YYYY")
                          .toDate()
                          .toString()
                          ?.split(" ")
                          ?.slice(0, 4)
                          ?.join(" ")}
                      </p>
                      <h1 className="text-lg font-bold">{title}</h1>
                      <p className="text-justify text-neutral-800 font-light">{excerpt}</p>
                    </div>
                  </li>
                </a>
              </Link>
            ))}
          </ul>
        </div>
      </section>
    </LandingLayout>
  )
}
