import _ from 'lodash';
import uuid from 'uuid/v4';
import {
    getImageDimensions,
    getAlteredDimensions
} from './util';
import jimp from 'jimp';

function isBuffer(image: string | Buffer): image is Buffer {
    if (_.isString(image)) {
        return false;
    }
    return true;
};

export async function getImageSnippet(image: string | Buffer, type: string, shouldExport = false) {
    try {
        let jimpImage: jimp;
        const dimensions = getImageDimensions(image);
        const alteredDimensions = getAlteredDimensions(dimensions, type);
        if (isBuffer(image)) {
            jimpImage = await jimp.read(image);
        } else {
            jimpImage = await jimp.read(image);
        }
        jimpImage.crop(alteredDimensions.left, alteredDimensions.top, alteredDimensions.width, alteredDimensions.height)
            .greyscale()
            .contrast(.730)
            .brightness(.235)
            .blur(1);
        if (shouldExport) {
            await exportImageSnippet(jimpImage);
        }
        return await jimpImage.getBufferAsync("image/jpeg"); //TDOO make more flexible
    } catch (err) {
        throw err;
    }
};

async function exportImageSnippet(jimpImage: jimp) {
    try {
        await jimpImage.write(`${uuid()}.${jimpImage.getExtension() || '.jpg'}`);
    } catch (err) {
        console.error(err);
    }
};

export default {
    getImageSnippet
};