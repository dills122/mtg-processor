const _ = require('lodash');
const constants = require('./constants');
const jimp = require('jimp');
const uuid = require('uuid/v4');
const {
    GetImageDimensions
} = require('./util');

const { height: heightMinimum, width: widthMinimum } = constants.minimumDimensions;

async function GetImageSnippet(imgPath, type) {
    if (dimensions.width < widthMinimum && dimensions.height < heightMinimum) {
        throw new Error("Image is to small");
    }
    let dimensions = await GetImageDimensions(imgPath);
    let alteredDimensions = GetAlteredDimensions(dimensions, type);
    let img = await jimp.read(imgPath);
    img.crop(alteredDimensions.left, alteredDimensions.top, alteredDimensions.width, alteredDimensions.height)
        .greyscale()
        .contrast(.730)
        .brightness(.235)
        .blur(1);
    return await img.getBufferAsync("image/jpeg");
}

async function GetImageSnippetFile(imgPath, type) {
    let path = `${uuid()}.${imgPath.split('.')[1] || '.jpg'}`;
    let dimensions = await GetImageDimensions(imgPath);
    if (dimensions.width < widthMinimum && dimensions.height < heightMinimum) {
        throw new Error("Image is to small");
    }
    let alteredDimensions = GetAlteredDimensions(dimensions, type);
    img = cropper(await jimp.read(imgPath), alteredDimensions, type);
    await img.writeAsync(path);
    return path;
}

async function GetImageSnippetTmpFile(imgPath, directory, type) {
    if (dimensions.width < widthMinimum && dimensions.height < heightMinimum) {
        throw new Error("Image is to small");
    }
    let path = `${directory}\\${uuid()}.${imgPath.split('.')[1] || '.jpg'}`;
    let dimensions = await GetImageDimensions(imgPath);
    let alteredDimensions = GetAlteredDimensions(dimensions, type);
    const img = cropper(await jimp.read(imgPath), alteredDimensions, type);
    await img.writeAsync(path);
    return path;
}

function GetAlteredDimensions(dimensions, type) {
    switch(type) {
        case 'name':
            return {
                width: _.round(dimensions.width * constants.name.widthPercent),
                height: _.round(dimensions.height * constants.name.heightPercent),
                left: _.round(dimensions.width * constants.borderPercent),
                top: _.round(dimensions.height * constants.borderPercent)
            }; 
        case 'type':
            return {
                width: _.round(dimensions.width * constants.type.widthPercent),
                height: _.round(dimensions.height * constants.type.heightPercent),
                left: _.round(dimensions.width * constants.borderPercent),
                top: _.round(dimensions.height * constants.type.topPercent)
            }; 
        case 'art':
            return {
                width: _.round(dimensions.width * constants.art.widthPercent),
                height: _.round(dimensions.height * constants.art.heightPercent),
                left: _.round(dimensions.width * constants.borderPercent),
                top: _.round(dimensions.height * constants.art.topPercent)
            }; 
        case 'flavor':
            return {
                width: _.round(dimensions.width * constants.flavor.widthPercent),
                height: _.round(dimensions.height * constants.flavor.heightPercent),
                left: _.round(dimensions.width * constants.borderPercent),
                top: _.round(dimensions.height * constants.flavor.topPercent)
            }; 
        default: 
            return {};
    }
}

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

module.exports = {
    GetImageSnippet,
    GetImageSnippetFile,
    GetImageSnippetTmpFile
};