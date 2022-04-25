import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"
const { BlitzGuardMiddleware } = require("@blitz-guard/core/dist/middleware")

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "hire-win",
      isAuthorized: simpleRolesIsAuthorized,
    }),
    BlitzGuardMiddleware({
      excluded: [
        "/api/auth/mutations/login",
        "/api/auth/mutations/logout",
        "/api/auth/mutations/signup",
        "/api/guard/queries/getAbility",
      ],
    }),
  ],
  images: {
    domains: ["s3.us-east-2.amazonaws.com"],
  },
  // Added temporarily as build was failing due to out of memory error -
  // FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
  // Uncomment experimental to resolve the error and comment it back
  // experimental: {
  //   esmExternals: false,
  // },
  /* Uncomment this to customize the webpack config */
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    if (isServer) {
      config.externals.push("_http_common")
      // config.externals.push('encoding');
    }
    config.resolve.fallback = {
      stream: false,
      util: false,
    }
    return config
  },
}
module.exports = config
