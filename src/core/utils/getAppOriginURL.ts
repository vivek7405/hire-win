export function getAppOriginURL() {
  return "location" in window ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
}
