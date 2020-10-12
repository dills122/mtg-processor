import _ from 'lodash';
import uuid from 'uuid/v4';
import {
    getImageDimensions,
    getAlteredDimensions
} from './util';
import jimp from 'jimp';

const constants = require('./constants');

function isBuffer(image: string | Buffer): image is Buffer {
    if (_.isString(image)) {
        return false;
    }
    return true;
};

const { height: heightMinimum, width: widthMinimum } = constants.minimumDimensions;

export async function getImageSnippet(image: string | Buffer, type: string) {
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
        return await jimpImage.getBufferAsync("image/jpeg"); //TDOO make more flexible
    } catch (err) {
        
    }
};

// export async function getImageSnippetFile(imgPath, type) {
//     let path = `${uuid()}.${imgPath.split('.')[1] || '.jpg'}`;
//     let dimensions = await GetImageDimensions(imgPath);
//     if (dimensions.width < widthMinimum && dimensions.height < heightMinimum) {
//         throw new Error("Image is to small");
//     }
//     let alteredDimensions = GetAlteredDimensions(dimensions, type);
//     img = cropper(await jimp.read(imgPath), alteredDimensions, type);
//     await img.writeAsync(path);
//     return path;
// }

// async function GetImageSnippetTmpFile(imgPath, directory, type) {
//     if (dimensions.width < widthMinimum && dimensions.height < heightMinimum) {
//         throw new Error("Image is to small");
//     }
//     let path = `${directory}\\${uuid()}.${imgPath.split('.')[1] || '.jpg'}`;
//     let dimensions = await GetImageDimensions(imgPath);
//     let alteredDimensions = GetAlteredDimensions(dimensions, type);
//     const img = cropper(await jimp.read(imgPath), alteredDimensions, type);
//     await img.writeAsync(path);
//     return path;
// }

function cropper(img, dimensions, type) {
    if (type !== 'art' || type !== 'flavor') {
        return img.crop(dimensions.left, dimensions.top, dimensions.width, dimensions.height)
            .greyscale()
            .contrast(.730)
            .brightness(.235)
            .blur(1);
    } else {
        return img.crop(dimensions.left, dimensions.top, dimensions.width, dimensions.height)
            .contrast(.730)
            .brightness(.235)
            .blur(1);
    }
}

export default {
    getImageSnippet
};