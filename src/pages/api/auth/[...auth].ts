import { passportAuth } from "@blitzjs/auth"
import { api } from "src/blitz-server"
import db, { UserRole } from "db"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Routes } from "@blitzjs/next"

export default api(
  passportAuth({
    // successRedirectUrl: "/",
    // errorRedirectUrl: "/",
    strategies: [
      {
        authenticateOptions: { scope: ["email", "profile"] },
        strategy: new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
              process.env.NODE_ENV === "production"
                ? "https://hire.win/api/auth/google/callback"
                : "http://localhost:3000/api/auth/google/callback",
            // includeEmail: true,
            // includeProfile: true,
          },
          async function (_token, _tokenSecret, profile, done) {
            const email = profile.emails && profile.emails[0]?.value

            if (!email) {
              // This can happen if you haven't enabled email access in your google app permissions
              return done(new Error("Google OAuth response doesn't have email."))
            }

            const user = await db.user.upsert({
              where: { email },
              create: {
                email,
                name: profile.displayName,
              },
              update: { email },
              //   include: { companies: { orderBy: { createdAt: "asc" } } },
            })

            const companyUsers = await db.companyUser.findMany({
              where: { userId: user.id },
            })

            // const companyUsers = user.companies
            const companyId = (companyUsers && (companyUsers[0]?.companyId || "0")) || "0"

            const publicData = {
              //   userId: user.id,
              //   roles: [user.role],
              //   source: "google",
              userId: user.id,
              role: user.role as UserRole,
              companyId,
            }
            done(undefined, {
              publicData,
              // redirectUrl:
              //   companyId === "0" ? Routes.NewCompany().pathname : Routes.JobsHome().pathname,
            })
          }
        ),
      },
    ],
  })
)
