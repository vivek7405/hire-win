// import { setupBlitzServer } from "@blitzjs/next"
// import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
// import { simpleRolesIsAuthorized } from "@blitzjs/auth"
// import db from "db"
// import { authConfig } from "./blitz-client"

// export const { gSSP, gSP, api } = setupBlitzServer({
//   plugins: [
//     AuthServerPlugin({
//       ...authConfig,
//       storage: PrismaStorage(db),
//       isAuthorized: simpleRolesIsAuthorized,
//     }),
//     // , BlitzGuardMiddleware({
//     //   excluded: [
//     //     "/api/auth/mutations/login",
//     //     "/api/auth/mutations/logout",
//     //     "/api/auth/mutations/signup",
//     //     "/api/guard/queries/getAbility",
//     //   ],
//     // })
//   ],
// })

import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"
import { BlitzLogger } from "blitz"
import db from "db"
import { authConfig } from "./blitz-client"

export const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      ...authConfig,
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  logger: BlitzLogger({}),
})
