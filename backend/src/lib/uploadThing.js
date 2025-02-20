import { createUploadthing } from "uploadthing/server";
import dotenv from "dotenv";

dotenv.config();

const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;

if (!UPLOADTHING_SECRET) {
  throw new Error("UploadThing API key is missing in .env file!");
}

const f = createUploadthing({ apiKey: UPLOADTHING_SECRET });

export const uploadImage = f({
  image: { maxFileSize: "4GB" },
}).onUploadComplete(({ file }) => {
  console.log("Uploaded file:", file.url);
  return { url: file.url };
});
