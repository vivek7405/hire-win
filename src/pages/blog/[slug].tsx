import { getAllBlogPosts } from "src/blog/utils/getAllBlogPosts"
import { getBlogPost } from "src/blog/utils/getBlogPost"
import ReactMarkdown from "react-markdown"
import LandingLayout from "src/core/layouts/LandingLayout"
import { ArrowNarrowLeftIcon } from "@heroicons/react/outline"
import Link from "next/link"
import { Routes } from "@blitzjs/next"
import moment from "moment"
import Head from "next/head"
import { BlogPostInputType } from "src/blog/validations"
import rehypeRaw from "rehype-raw"

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const posts = getAllBlogPosts()

  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const post = getBlogPost(params.slug)

  // Pass post data to the page via props
  return { props: { post } }
}

type InputType = {
  post: BlogPostInputType
}
export default function BlogPost({ post }: InputType) {
  return (
    <LandingLayout title="Hire.win | Blog">
      <Head>
        <title>{post.title ? `Hire.win | ${post.title}` : "Hire.win | Blog Post"}</title>
        <meta name="description" content={post.excerpt || ""} />
        <meta name="keywords" content={post.keywords?.join(",") || ""} />
        {post.image ? <meta property="og:image" content={post.image} key="ogimage" /> : null}
        {/* {post.author ? <meta name="author" content={post.author} /> : null} */}
        <link rel="canonical" href={`${Routes.Blog().pathname}/${post.slug}`} />
      </Head>
      <section className="px-4 lg:mt-5">
        <div className="w-full h-full flex items-center justify-center">
          <div className="p-5 sm:p-10 bg-white rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Link href={Routes.Blog()}>
                <a className="flex items-center justify-start space-x-2 text-theme-600 hover:text-theme-800">
                  <ArrowNarrowLeftIcon className="w-5 h-5" />
                  <span>All Posts</span>
                </a>
              </Link>
            </div>
            <div className="prose prose-sm md:prose-base lg:prose-lg prose-stone">
              <ReactMarkdown className="text-center">
                {`_${moment(post.date, "MM-DD-YYYY")
                  .toDate()
                  .toString()
                  ?.split(" ")
                  ?.slice(0, 4)
                  ?.join(" ")}_`}
              </ReactMarkdown>
              <ReactMarkdown className="text-center block lg:hidden">{`## ${post.title}`}</ReactMarkdown>
              <ReactMarkdown className="text-center hidden lg:block">{`# ${post.title}`}</ReactMarkdown>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content || ""}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
