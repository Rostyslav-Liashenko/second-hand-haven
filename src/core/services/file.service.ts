import { Injectable } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';


@Injectable()
export class FileService {
    public isExistDirectory(directory: string): boolean {
        return fs.existsSync(directory);
    }

    public deleteFilesInDirectory(directory: string): void {
        fs.readdir(directory, (err, files) => {

            for (const file of files) {
                fs.unlink(path.join(directory, file), (err) => {
                    if (err) throw err;
                });
            }
        })
    }

    public deleteDirectoryIncludeFile(directory: string): void {
         fs.rmSync(directory, { recursive: true });
    }
}