import AWS from "aws-sdk"

const getFile = async (req, res) => {
  const body = req.body

  const region = process.env.S3_BUCKET_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_KEY
  const s3 = new AWS.S3({ region, accessKeyId, secretAccessKey })
  const params = {
    Key: body.Key,
    Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : "hire.win",
  }

  return new Promise(async (resolve, reject) => {
    try {
      const file = await s3.getObject(params).promise()
      res.status(200).send(file)
      resolve(file)
    } catch (err) {
      res.status(500).send(err)
      resolve(err)
    }
  })
}

export default getFile
