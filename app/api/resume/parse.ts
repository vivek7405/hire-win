import axios from "axios"
import cheerio from "cheerio"
import FormData from "form-data"

// function streamToBuffer(stream) {
//   const chunks: any[] = []
//   return new Promise((resolve, reject) => {
//     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
//     stream.on("error", (err) => reject(err))
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
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

  // const region = process.env.S3_BUCKET_REGION
  // const accessKeyId = process.env.S3_ACCESS_KEY
  // const secretAccessKey = process.env.S3_SECRET_KEY
  // const s3 = new AWS.S3({ region, accessKeyId, secretAccessKey })
  // const params = {
  //   Key: body.Key,
  //   Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : "hire.win",
  // }
  // const readStream = await s3.getObject(params).createReadStream()
  // const resumeData = await s3.getObject(params).promise()
  // const streamBuffer = await streamToBuffer(readStream)

  if (
    !(
      process.env.RESUME_PARSE_POSTINGS_URL &&
      process.env.RESUME_PARSE_API_URL &&
      process.env.RESUME_PARSE_ORIGIN_URL &&
      process.env.RESUME_PARSE_REFERRER_URL
    )
  ) {
    res.status(404).send("Env variables not set for Resume Parsing")
    return
  }

  const readStream = (
    (await axios({
      method: "get",
      url: body.Location,
      responseType: "stream",
    })) as any
  )?.data

  const formData = new FormData()
  formData.append("resume", readStream)

  const post = await modFetch(
    `${process.env.RESUME_PARSE_POSTINGS_URL}&skip=${Math.floor(Math.random() * 20)}`,
    "json"
  )
  if (!post) res.status(500).send({ message: "error" })
  const data = await modFetch(post[0]["applyUrl"], "text")
  const $ = cheerio.load(data)
  const csrf = $("#csrf-token")["0"]?.attribs.value as string
  const postingId = $("#posting-id")["0"]?.attribs.value as string

  formData.append("csrf", csrf)
  formData.append("postingId", postingId)

  await fetch(process.env.RESUME_PARSE_API_URL, {
    method: "POST",
    headers: {
      Origin: process.env.RESUME_PARSE_ORIGIN_URL,
      Referer: process.env.RESUME_PARSE_REFERRER_URL,
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        res
          .status(response.status)
          .send(response.status == 500 ? "Could not parse resume" : "Could not connect")

        return
      }
      return response.json()
    })
    .then((response) => response && res.json(response))
    .catch((error) => {
      console.error(error)
    })
}
