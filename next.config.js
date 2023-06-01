// @ts-check
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  images: {
    domains: ["s3.us-east-2.amazonaws.com"],
  },
  redirects: async () => {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home.php",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
    ]
  },
}

module.exports = withBlitz(config)
