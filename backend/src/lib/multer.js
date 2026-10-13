import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/uploads"
);
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDirectory),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

export const upload = multer({ storage });