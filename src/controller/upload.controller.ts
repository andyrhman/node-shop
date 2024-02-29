import { Request, Response } from "express"
import { extname } from "path";
import multer from "multer";

export const Upload = async (req: Request, res: Response) => {

    const storage = multer.diskStorage({
        destination: './uploads',
        filename(_, file, callback){
            const randomName = Math.random().toString(20).slice(2, 12);
            return callback(null, `${randomName}${extname(file.originalname)}`);
        }
    });

    // using image in single(image) for the form-data key
    const upload = multer({storage}).single('image');

    upload(req, res, (err: any) =>{
        if (err) {
            return res.status(400).send(err)
        }

        res.send({
            url: `${process.env.ORIGIN_1}/api/uploads/${req.file.filename}`
        })
    })

}