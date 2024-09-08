import { Request, Response } from "express";
import { extname } from "path";
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";

// Memory storage for multer
const storage = multer.memoryStorage();

// Multer middleware
const upload = multer({ storage }).single('image');

export const Upload = async (req: Request, res: Response) => {
    upload(req, res, async (err: any) => {
        if (err) {
            return res.status(400).send(err);
        }

        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        try {
            // Upload the image to Cloudinary in the specific folder
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'NodeShop',
                        public_id: `${Math.random().toString(20).slice(2, 12)}${extname(req.file.originalname)}`
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            res.send({
                url: (result as any).secure_url,
                public_id: (result as any).public_id
            });

        } catch (err) {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    });
};