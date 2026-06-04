import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an in-memory file buffer to Cloudinary.
 * @param {Buffer} buffer - file buffer from multer memory storage
 * @param {string} folder - destination folder in Cloudinary
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, folder = 'zyvora') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Remove an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
  }
};

export default cloudinary;
