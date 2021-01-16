import { imageSize } from 'image-size';
import constants from './constants';
import _ from 'lodash';

export interface Dimensions {
    width: number,
    height: number
};

export interface AlteredDimensions {
    width: number,
    height: number,
    left: number,
    top: number
};

export function getImageDimensions(image: string | Buffer): Dimensions {
    const { height, width } = imageSize(image);
    if (!height || !width) {
        throw Error('No dimensions found');
    }
    return {
        height,
        width
    };
};

//TODO Imprv: make 'type' a typed value to avoid issues 
export function getAlteredDimensions(dimensions: Dimensions, type: string): AlteredDimensions {
    switch (type) {
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
            throw Error('Type not found, unable to alter dimensions');
    }
}

export default {
    getImageDimensions,
    getAlteredDimensions
};