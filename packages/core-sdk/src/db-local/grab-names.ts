import { db } from './db';

export interface NameRecord {
    name: string;
};

export async function GetBulkNames() : Promise<Array<NameRecord>> {
    return new Promise((resolve, reject) => {
        db.find({}, (err, docs) => {
            if (err) {
                return reject(err);
            }
            return resolve(docs || []);
        });
    });
};

export default {
    GetBulkNames
};