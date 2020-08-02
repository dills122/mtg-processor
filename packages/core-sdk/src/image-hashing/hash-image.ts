import _ from 'lodash';
import { imageHash } from 'image-hash';
import { Buffer } from 'buffer';
import stringSimilarity from 'string-similarity';
import Logger from '../logger/log';
const dependencies = {
    imageHash
};
const logger = new Logger({
    isPretty: true
});

export default {
    hashImage,
    compareHash
};

/**
 * Hash image
 * @param {string | Buffer } input - image to hash
 */
export async function hashImage(input: string | Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        dependencies.imageHash(Buffer.isBuffer(input) ? { data: input } : input, 16, true, (error, data) => {
            if (error) {
                return reject(error);
            }
            if (!data) {
                return reject(new Error('No data or empty data was returned'));
            }
            return resolve(data);
        });
    });
};

/**
 * Compare to image hashes by two-bit and four-bit segments
 * @param {string} hashOne - hash one to compare
 * @param {string} hashTwo - hash two to compare
 */
export function compareHash(hashOne: string, hashTwo: string) {
    logger.info(`hash-image::CompareHash:: Comparing Hashes ${hashOne} ${hashTwo}`);
    let HashLength = hashOne.length;
    let twoBitMatches = 0;
    let fourBitMatches = 0;
    hashOne.split('').forEach((_c, index) => {
        if (index % 2 === 0) {
            let hashOneDoubleStr = hashOne.slice(index - 2, index);
            let hashTwoDoubleStr = hashTwo.slice(index - 2, index);
            twoBitMatches += hashOneDoubleStr === hashTwoDoubleStr ? 1 : 0;
        }
        if (index % 4 === 0) {
            let hashOneQuadStr = hashOne.slice(index - 4, index);
            let hashTwoQuadStr = hashTwo.slice(index - 4, index);
            fourBitMatches += hashOneQuadStr === hashTwoQuadStr ? 1 : 0;
        }
    });
    let comparisonResults = {
        twoBitMatches: _.round(twoBitMatches / (HashLength / 2), 2),
        fourBitMatches: _.round(fourBitMatches / (HashLength / 4), 2),
        stringCompare: _.round(stringSimilarity.compareTwoStrings(hashOne, hashTwo), 2)
    };
    logger.info("hash-image::CompareHash:: Hash Comparison Results", comparisonResults);
    return comparisonResults;
};