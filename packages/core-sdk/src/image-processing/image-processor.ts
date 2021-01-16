import _ from 'lodash';
import Logger from '../logger/log';
import resize from './resize';
import { textExtraction } from '../image-analysis';

const dependencies = {
    resize,
    textExtraction
};

export interface ImageProcessorArgs {
    image: Buffer,
    type: String,
    shouldExport?: boolean,
    logger?: Logger
};

export interface ExtractionResults {
    dirtyText: any;
    cleanText: string;
}

export default class ImageProcessor {
    logger: Logger;
    imageSnippet: Buffer;
    image: Buffer;
    type: string;
    shouldExport: boolean | undefined;
    extractionResults: ExtractionResults;

    constructor(args: ImageProcessorArgs) {
        _.assign(this, args);
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
            this.extractionResults = await dependencies.textExtraction.ScanImage(this.imageSnippet || this.image);
        } catch (err) {
            throw err;
        }
    }
};

export {
    dependencies,
    ImageProcessor
};