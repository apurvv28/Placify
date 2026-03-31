const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const getEnv = (name, fallback = '') => {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const region = getEnv('AWS_REGION', 'ap-south-1');
const bucket = getEnv('S3_RESUME_BUCKET', '');
const prefix = getEnv('S3_RESUME_PREFIX', 'uploads');

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

const isS3ResumeStorageEnabled = () => Boolean(bucket);

const makeKey = (filename) => {
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  return cleanPrefix ? `${cleanPrefix}/${filename}` : filename;
};

const uploadResumeBuffer = async ({ filename, buffer, contentType }) => {
  const key = makeKey(filename);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    })
  );
  return { key };
};

const getResumeObject = async (filename) => {
  const key = makeKey(filename);
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
};

module.exports = {
  isS3ResumeStorageEnabled,
  uploadResumeBuffer,
  getResumeObject,
};
