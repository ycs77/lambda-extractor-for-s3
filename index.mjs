import { PassThrough } from 'node:stream'
import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import yauzl from 'yauzl'
import { lookup } from 'mime-types'

const uploadStream = ({ Bucket, Key }) => {
  const pass = new PassThrough()
  const multipartUpload = new Upload({
    client: new S3(),
    params: {
      Bucket,
      Key,
      Body: pass,
      ACL: 'public-read',
      ContentType: lookup(Key) || 'application/octet-stream',
    },
  })
  return {
    writeStream: pass,
    promise: multipartUpload.done()
  }
}

const extractZip = (Bucket, targetDirectory, buffer) => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err)
        return
      }
      zipfile.readEntry()
      zipfile.on('entry', entry => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          // skip to the next entry
          zipfile.readEntry()
        } else {
          // file entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err)
              return
            }
            const { writeStream, promise } = uploadStream({
              Bucket,
              Key: `${targetDirectory}/${entry.fileName}`,
            })
            readStream.pipe(writeStream)
            promise.then(() => {
              console.log(`File uploaded into S3 bucket: "${Bucket}", with key: "${entry.fileName}"`)
              zipfile.readEntry()
            })
          })
        }
      })
      zipfile.on('end', () => resolve('end'))
    })
  })
}

export const handler = async (event, context) => {
  if (!process.env.LAMBDA_EXTRACT_DIR) {
    throw new Error('Missing LAMBDA_EXTRACT_DIR environment variable')
  }

  console.log('Received event:', JSON.stringify(event, null, 2))

  const s3 = new S3()

  const Bucket = event.Records[0].s3.bucket.name
  const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  const targetDirectory = process.env.LAMBDA_EXTRACT_DIR

  try {
    const object = await s3.getObject({ Bucket, Key })

    await extractZip(Bucket, targetDirectory, Buffer.concat(
      await object.Body?.toArray()
    ))

    await s3.deleteObject({ Bucket, Key })

    return {
      status: 200,
      body: Key,
    }
  } catch (error) {
    console.log(`File upload failed with S3 bucket: "${Bucket}" and zip key: "${Key}"`)
    throw error
  }
}
