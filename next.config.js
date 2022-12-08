// @ts-check
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  images: {
    domains: ["s3.us-east-2.amazonaws.com"],
  },
}

module.exports = withBlitz(config)
