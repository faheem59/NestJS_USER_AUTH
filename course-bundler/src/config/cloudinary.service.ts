import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(file: Express.Multer.File, publicId: string): Promise<any> {
    if (!file) {
      throw new Error('File cannot be empty.');
    }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadVideo(file: Express.Multer.File, publicId: string): Promise<any> {
    if (!file) {
      throw new Error('File cannot be empty.');
    }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'video' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
