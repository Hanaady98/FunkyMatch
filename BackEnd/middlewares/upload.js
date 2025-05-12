import multer from "multer";
import fs from 'fs';
import { randomUUID } from "crypto";

const normalizeFileName = (fileName) => {
    return Buffer.from(fileName.trim(), 'latin1').toString('utf8').trim();
};

const dest = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = `public/uploads/${req.user._id}`;
        fs.mkdirSync(dir, { recursive: true });
        callback(null, dir);
    },
    filename: (req, file, callback) => {
        const trimmedFileName = normalizeFileName(file.originalname);
        const normalizedFileName = `${randomUUID()}-${trimmedFileName}`;
        req.fileName = `http://localhost:8181/uploads/${req.user._id}/${normalizedFileName}`;
        callback(null, normalizedFileName);
    }
});

export const upload = multer({
    storage: dest,
    limits: { fileSize: 1000000 }, // 1MB
    fileFilter: (req, file, callback) => {
        const trimmedFileName = normalizeFileName(file.originalname);

        if (!trimmedFileName.match(/\.(pdf|docx|doc|png|jpg|jpeg)$/)) {
            return callback(
                new Error("Please upload a PDF, Word document, or an image")
            );
        }
        callback(null, true);
    }
}).single('file');
