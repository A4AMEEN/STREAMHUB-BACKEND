import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv';
dotenv.config();
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
  region:'ap-southeast-2',
});


const uploadS3Video = async (file: Express.Multer.File): Promise<UploadResult> => {
  const params = {
    Bucket: 'streamhub-bucket',
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: 'video/mp4',
    ContentDisposition: 'inline'
  };

  console.log('uploading video: ', params);
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

export { uploadS3Video };