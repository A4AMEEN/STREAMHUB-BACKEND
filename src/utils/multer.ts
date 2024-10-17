import multer from "multer";

const storage = multer.memoryStorage();

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  }
});

export const upload: multer.Multer = uploadMiddleware;