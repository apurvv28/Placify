const { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

const getEnv = (name, fallback = '') => {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const region = getEnv('AWS_REGION', 'ap-south-1');
const bucket = getEnv('S3_INTERVIEWIQ_BUCKET', 'placify-interview-recordings');

const s3Config = { region };

const accessKeyId = getEnv('AWS_ACCESS_KEY_ID', '');
const secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY', '');
const sessionToken = getEnv('AWS_SESSION_TOKEN', '');

if (accessKeyId && secretAccessKey) {
  s3Config.credentials = {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {}),
  };
}

const s3Client = new S3Client(s3Config);
let bucketReadyPromise = null;

const isMissingBucketError = (error) => {
  const code = String(error?.name || error?.Code || error?.code || '');
  return code === 'NoSuchBucket' || code === 'NotFound' || code === '404';
};

const ensureBucketExists = async () => {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      try {
        await s3Client.send(
          new HeadBucketCommand({
            Bucket: bucket,
          })
        );
        return bucket;
      } catch (error) {
        if (!isMissingBucketError(error)) {
          throw error;
        }

        const createBucketParams = { Bucket: bucket };
        if (region !== 'us-east-1') {
          createBucketParams.CreateBucketConfiguration = { LocationConstraint: region };
        }

        await s3Client.send(new CreateBucketCommand(createBucketParams));
        return bucket;
      }
    })().catch((error) => {
      bucketReadyPromise = null;
      throw error;
    });
  }

  return bucketReadyPromise;
};

const uploadInterviewRecordingBuffer = async ({ key, buffer, contentType }) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const putObject = async () =>
    s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'video/webm',
        Expires: expiresAt,
        Metadata: {
          ttl_days: '7',
        },
      })
    );

  try {
    await ensureBucketExists();
    await putObject();
  } catch (error) {
    if (!isMissingBucketError(error)) {
      throw error;
    }

    bucketReadyPromise = null;
    await ensureBucketExists();
    await putObject();
  }

  return {
    bucket,
    key,
    expiresAt: expiresAt.toISOString(),
  };
};

module.exports = {
  interviewRecordingBucket: bucket,
  uploadInterviewRecordingBuffer,
};
