import { api } from "src/blitz-server";
import { IncomingForm } from "formidable"
import AWS from "aws-sdk"
import fs from "fs"

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

// eslint-disable-next-line import/no-anonymous-default-export
export default api(api(async (req, res) => {
  // let s3 = new AWS.S3({
  //   accessKeyId: process.env.S3_ACCESS_KEY,
  //   secretAccessKey: process.env.S3_SECRET_KEY,
  //   endpoint: process.env.S3_ENDPOINT,
  //   s3ForcePathStyle: true, // needed with minio?
  //   signatureVersion: "v4",
  // })

  const region = process.env.S3_BUCKET_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_KEY
  const s3 = new AWS.S3({ region, accessKeyId, secretAccessKey })

  const form = new IncomingForm()
  form.uploadDir = "./"
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    try {
      const fileBody = fs.readFileSync(files.file.filepath)

      const splitArr = files.file.originalFilename.split(".")
      const fileExt = splitArr && splitArr.length > 0 ? "." + splitArr[splitArr.length - 1] : ""

      const params = {
        Key: files.file.newFilename + fileExt,
        ContentType: files.file.type,
        Body: fileBody,
        Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : "hire.win",
      }

      const put = s3.upload(params)

      const response = await put.promise()

      res.status(200).send({
        Location: response.Location,
        Key: response.Key,
      })
    } catch (e) {
      res.status(500).send(e)
    }
  })
}));
