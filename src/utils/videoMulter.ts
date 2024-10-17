import multer from "multer";
// import path from 'path';
// import fs from 'fs';

const videoStorage = multer.memoryStorage()
const singleVideoUpload = multer({ storage: videoStorage })

export default singleVideoUpload