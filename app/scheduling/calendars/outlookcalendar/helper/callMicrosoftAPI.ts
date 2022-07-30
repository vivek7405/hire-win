import * as request from "request"

interface Options {
  method: "POST" | "GET"
  url: string
  formData?: object
  body?: string
  headers?: object
}

export default async function makeRequestTo(options: Options): Promise<any> {
  return new Promise((resolve, reject) => {
    request(options, function (error, response) {
      if (error) reject(error)
      try {
        const res = JSON.parse(response?.body || "{}") || {}
        resolve(res)
      } catch (err) {
        throw new Error("Failed to parse response body")
      }
    })
  })
}
