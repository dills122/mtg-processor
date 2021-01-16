import _ from 'lodash';
import joi from '@hapi/joi';
import Logger from '../logger/log';
import { textExtraction } from '../image-analysis';
import { ImageProcessor } from '../image-processing';
import { MatchName } from '../fuzzy-matching';
import { MatchResults } from '../fuzzy-matching/match-name';

const dependencies = {
    textExtraction,
    ImageProcessor,
    MatchName
};

const schema = joi.object().keys({
    file: joi.object().required()
});

export default class Processor {
    logger: Logger;
    file: Buffer;

    constructor(params = {}) {
        let validatedSchema = joi.attempt(params, schema);
        _.assign(this, validatedSchema);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    async execute() {
        try {
            const nameImageProcessorInst = new dependencies.ImageProcessor({
                logger: this.logger,
                image: this.file,
                type: 'name'
            });
            await nameImageProcessorInst.extract();
            const nameExtractionResults = nameImageProcessorInst.extractionResults;
            const nameMatchResults = await new dependencies.MatchName({
                cleanText: nameExtractionResults.cleanText,
                logger: this.logger
            }).Match();
            if (nameMatchResults.length <= 0) {
                this.logger.warn('Unable to gather any match results', {
                    ...nameExtractionResults
                });
                return;
            }
            if (nameMatchResults.length > 1) {
                this.logger.info('Found multiple name match results, executing needs attention route', {
                    ...nameExtractionResults,
                    nameMatchResults
                });
                return await this.executeNeedsAttention(nameMatchResults);
            }
            this.logger.info('Found single name match, executing collection route', {
                ...nameExtractionResults,
                nameMatchResults
            });
            return await this.executeCollection(nameMatchResults);
        } catch (err) {
            this.logger.error('Error processing card', err);
            process.exit(1);
        }
    }

    async executeNeedsAttention(nameMatchResults: MatchResults[]): Promise<void> {

    }

    async executeCollection(nameMatchResults: MatchResults[]): Promise<void> {

    }
};