import _ from 'lodash';
import joi from '@hapi/joi';
import Logger from '../logger/log';
import resize from './resize';
import { textExtraction } from '../image-analysis';

const dependencies = {
    resize,
    textExtraction
};

const schema = joi.object().keys({
    image: joi.alternatives(joi.string(), joi.object()).required(),
    type: joi.string().required(),
    shouldExport: joi.bool().optional(),
    logger: joi.object().optional()
});

export default class ImageProcessor {
    logger: Logger;
    imageSnippet: Buffer;
    image: string | Buffer;
    type: string;
    shouldExport: boolean | undefined;
    extractionResults: { dirtyText: any; cleanText: string; }; //TODO update with proper interface type

    constructor(params = {}) {
        let validatedSchema = joi.attempt(params, schema);
        _.assign(this, validatedSchema);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    async extract() {
        try {
            await this.cropImage();
            await this.extractText();
        } catch (err) {
            //TODO update final error handling
            throw err;
        }
    }

    async cropImage() {
        try {
            this.imageSnippet = await dependencies.resize.getImageSnippet(this.image, this.type, this.shouldExport);
        } catch (err) {
            throw err;
        }
    }

    async extractText() {
        try {
            if (_.isString(this.image)) {
                throw new Error('Currently not supported'); //TODO fix
            }
            this.extractionResults = await dependencies.textExtraction.ScanImage(this.image);
        } catch (err) {
            throw err;
        }
    }
};

export {
    dependencies,
    ImageProcessor
};