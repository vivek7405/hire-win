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
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
}
module.exports = config
