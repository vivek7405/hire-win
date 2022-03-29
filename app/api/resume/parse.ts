import randInt from "app/core/utils/randInt"
import AWS from "aws-sdk"
import cheerio from "cheerio"
import FormData from "form-data"

// function streamToBuffer(stream) {
//   const chunks: any[] = []
//   return new Promise((resolve, reject) => {
//     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
//     stream.on("error", (err) => reject(err))
//     // stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
//     stream.on("end", () => resolve(Buffer.concat(chunks)))
//   })
// }

export const config = {
  api: {
    bodyParser: true,
  },
}

async function modFetch(url, option) {
  return await (await fetch(url))[option]()
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const body = req.body

  const region = process.env.S3_BUCKET_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_KEY

  const s3 = new AWS.S3({ region, accessKeyId, secretAccessKey })

  const params = {
    Key: body.Key,
    Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : "hire.win",
  }

  // const stream = await s3.getObject(params).createReadStream()
  // const streamBuffer = streamToBuffer(stream)
  const resumeData = await s3.getObject(params).promise()

  const formData = new FormData()
  formData.append("resume", resumeData?.Body?.toString("utf-8")!)

  // Lever has 350 posts in its demo
  // const postingSkip = randInt(1, 350)
  const post = await modFetch(
    `https://api.lever.co/v0/postings/leverdemo?skip=${Math.floor(
      Math.random() * 20
    )}&limit=1&mode=json`,
    "json"
  )
  if (!post) res.status(500).send({ message: "error" })
  const data = await modFetch(post[0]["applyUrl"], "text")
  // const postingInfo = await (
  //   await fetch(
  //     `https://api.lever.co/v0/postings/leverdemo?skip=${Math.floor(
  //       Math.random() * 20
  //     )}&limit=1&mode=json`
  //   )
  // ).json()
  // const postingURL = postingInfo[0]["applyUrl"]
  // const posting = await (await fetch(postingURL))?.json()
  // const $ = cheerio.load(posting?.text)
  const $ = cheerio.load(data)
  const csrf = $("#csrf-token")["0"]?.attribs.value as string
  const postingId = $("#posting-id")["0"]?.attribs.value as string

  formData.append("csrf", csrf)
  formData.append("postingId", postingId)

  await fetch("https://jobs.lever.co/parseResume", {
    method: "POST",
    headers: {
      Origin: "https://jobs.lever.co",
      Referer: "https://jobs.lever.co/parse",
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        res
          .status(response.status)
          .send(response.status == 500 ? "Could not parse resume" : "Could not connect to Lever")

        return
      }
      return response.json()
    })
    .then((response) => response && res.json(response))
    .catch((error) => {
      console.error(error)
    })
}
