import fs from 'fs';
import {
    promisify
} from 'util';
import uuid from 'uuid/v4';
import tempDirectory from 'temp-dir';
import rimraf from 'rimraf';

const writeFile = promisify(fs.writeFile);
const unlinkFile = promisify(fs.unlink);

export async function WriteToFile(contents, path: string = '') {
    return await writeFile(path || `${uuid()}.json`, JSON.stringify(contents));
};

export async function DeleteFile(path: string) {
    return await unlinkFile(path);
};

export function CreateDirectory(callback: Function) {
    const dirPath = `${tempDirectory}\\${uuid()}`;
    fs.mkdir(dirPath, (err) => {
        if (err) {
            return callback(err);
        }
        return callback(null, dirPath);
    });
};

export function CleanUpFiles(directory: string, callback: Function) {
    rimraf(directory, (err) => {
        if (err) {
            return callback(err);
        }
        return callback();
    });
};