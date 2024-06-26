import { checkEnvVariable } from "src/core/utils/checkEnvVariables"

export const constants = {
  get client_id() {
    checkEnvVariable("MICROSOFT_CLIENT_ID")
    return process.env.MICROSOFT_CLIENT_ID!
  },
  get client_secret() {
    checkEnvVariable("MICROSOFT_CLIENT_SECRET")
    return process.env.MICROSOFT_CLIENT_SECRET!
  },
  get redirect_uri() {
    checkEnvVariable("NEXT_PUBLIC_APP_URL")
    return process.env.NEXT_PUBLIC_APP_URL + "/outlookRedirect"
  },
  response_mode: "query",
  scope: "offline_access user.read calendars.ReadWrite",
  response_type: "code",
  baseURL: "https://login.microsoftonline.com/common/oauth2/v2.0/",
  grant_type_code: "authorization_code",
  grant_type_refresh: "refresh_token",
} as const
