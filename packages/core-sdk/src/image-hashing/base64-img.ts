const base64Img = require('image-to-base64');
import Logger from '../logger/log';
const logger = new Logger({
    isPretty: true
});

export const dependencies = {
    base64Img
};

export interface ImagePaths {
    flavorImage: string,
    artImage: string,
    typeImage: string,
    nameImage: string
};

/**
 * Convert image extractions to base64 strings
 * @param {ImagePaths} imagePaths - image extraction paths 
 * @returns {ImagePaths} - base64 strings of each image extraction
 */
export async function stringfyImageExtractions(imagePaths: ImagePaths): Promise<ImagePaths> {
    try {
        let flavorImage = await dependencies.base64Img(imagePaths.flavorImage);
        let artImage = await dependencies.base64Img(imagePaths.artImage);
        let typeImage = await dependencies.base64Img(imagePaths.typeImage);
        let nameImage = await dependencies.base64Img(imagePaths.nameImage);
        let base64Images = {
            flavorImage,
            artImage,
            typeImage,
            nameImage
        };
        logger.info(`base64-img::StringfyImagesNDAtn : ${Object.keys(base64Images)}`);
        return base64Images;
    } catch (error) {
        logger.error(error);
        return error;
    }
};

/**
 * Converts image buffers to base64
 * @param {Buffer} buffer - image buffer to convert 
 * @returns {string} - base64 representation of the image
 */
export function stringfyBuffer(buffer: Buffer): string {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('input is not a buffer'); //This is since the repo is not fully ts yet
    }
    return buffer.toString('base64');
};

export default {
    stringfyImageExtractions,
    stringfyBuffer,
    dependencies
};