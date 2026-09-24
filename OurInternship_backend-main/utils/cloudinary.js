import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true,   
  });
};

/**
 * Upload PDF certificate to Cloudinary (PUBLIC RAW FILE)
 */
export const uploadCertificateToCloudinary = async (filePath, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      type: "upload",               // ✅ REQUIRED
      public_id: `certificates/${fileName}`,
       access_mode: "public", 
      overwrite: true,
      use_filename: true,
      unique_filename: false,
    });

    // cleanup local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url; // 🔥 PUBLIC URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error("Certificate upload failed");
  }
};

export const uploadPDFToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder,
      overwrite: true,
      
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};
export const deleteFromCloudinaryByUrl = async (fileUrl) => {
  if (!fileUrl) return;
  // Example URL:
  // https://res.cloudinary.com/demo/raw/upload/offer_letters/APP123.pdf
  const parts = fileUrl.split("/");
  const publicIdWithExt = parts.slice(-2).join("/"); 
  const publicId = publicIdWithExt.replace(".pdf", "");

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "auto",
    type: "upload",
  });
};
export default connectCloudinary;
