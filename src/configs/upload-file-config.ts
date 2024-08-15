import { diskStorage } from 'multer';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';

export const storageProductFolder = 'product';
export const storageUserFolder = 'user';
export const corePath = './public/images'

const handleDestination = (req, file, cb, path: string, id: string): void => {
    const directory = `${corePath}/${path}/${id}`;

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {recursive: true})
    }

    cb(null, directory);
}

const handleFilename = (req, file, cb): void => {
    const correctFileName = path.parse(file.originalname).name.replaceAll(/\s/g, '');
    const filename = `${correctFileName}__${uuidv4()}`;
    const extension = path.parse(file.originalname).ext;

    cb(null, `${filename}${extension}`);
}

export const productStorage = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const productId = req.query.productId as string;

            handleDestination(req, file, cb, storageProductFolder, productId);
        },
        filename: (req, file, cb) => {
            handleFilename(req, file, cb);
        },
    }),
}

export const userStorage = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const id = req.query.userId as string;

            handleDestination(req, file, cb, storageUserFolder, id);
        },
        filename: (req, file, cb) => {
            handleFilename(req, file, cb);
        },
    }),
}