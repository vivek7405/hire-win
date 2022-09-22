import AWS from "aws-sdk"

export const config = {
  api: {
    bodyParser: true,
  },
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  res.statusCode = 200
  const body = req.body

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

  const params = {
    Key: body.key,
    Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : "hire.win",
  }

  await s3.deleteObject(params, (err, _data) => {
    if (err) res.status(500).send(err).end()
    else res.end("Deleted file")
  })
}
