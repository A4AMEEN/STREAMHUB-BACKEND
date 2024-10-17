import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

interface UploadResult {
  success?: string;
  error?: boolean;
  msg?: any;
}


const s3config = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  region: process.env.S3_REGION || '',
});



const uploadS3Image = async (file: Express.Multer.File): Promise<UploadResult> => {
  if (!file.buffer) {
    console.error('File buffer is undefined');
    return { error: true, msg: 'File buffer is undefined' };
  }

  const params = {
    Bucket: 'streamhub-bucket',
    Key: `profile-pics/${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: 'inline'
  };

  console.log('uploading image: ', { ...params, Body: 'File buffer' });  // Don't log the entire buffer

  try {
    const data = await new Upload({
      client: s3config,
      params: params
    }).done();
    console.log('data from bucket', data);
    return { success: data.Location };
  } catch (err) {
    console.error('Error during upload', err);
    return { error: true, msg: err };
  }
};

export { uploadS3Image };