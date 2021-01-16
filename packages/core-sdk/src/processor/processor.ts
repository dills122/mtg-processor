import _ from 'lodash';
import Logger from '../logger/log';
import { ImageProcessor } from '../image-processing';
import { MatchName } from '../fuzzy-matching';
import { CardCollection } from '../models';

const dependencies = {
    ImageProcessor,
    MatchName: MatchName.default,
    CardCollection
};

export interface ProcessorArgs {
    file: Buffer,
    logger?: Logger
};

export default class Processor {
    logger: Logger;
    file: Buffer;
    nameMatchResults: MatchName.MatchResults[] = [];

    constructor(args: ProcessorArgs) {
        _.assign(this, args);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    async execute() {
        try {
            const nameMatchResult = await this.executeNameMatching();
            //TODO Create process for checking against hashes
        }
    }

    async executeNameMatching() {
        try {
            const nameImageProcessorInst = new dependencies.ImageProcessor({
                logger: this.logger,
                image: this.file,
                type: 'name'
            });
            await nameImageProcessorInst.extract();
            const nameExtractionResults = nameImageProcessorInst.extractionResults;
            this.nameMatchResults = await new dependencies.MatchName({
                cleanText: nameExtractionResults.cleanText,
                logger: this.logger
            }).Match();
            if (this.nameMatchResults.length <= 0) {
                this.logger.warn('Unable to gather any match results', {
                    ...nameExtractionResults
                });
                throw Error('No matching results found, unable to proceed');
            }
            if (this.nameMatchResults.length > 1) {
                this.logger.info('Found multiple name match results, executing needs attention route', {
                    ...nameExtractionResults,
                    nameMatchResults: this.nameMatchResults
                });
                //TODO update with another way to handle and sift through multiple name matching results
                return this.nameMatchResults[0];
            }
            this.logger.info('Found single name match, executing collection route', {
                ...nameExtractionResults,
                nameMatchResults: this.nameMatchResults
            });
            return this.nameMatchResults[0];
        } catch (err) {
            this.logger.error('Error processing card', err);
            throw err;
        }
    }

    async executeNeedsAttention(nameMatchResults: MatchName.MatchResults[]): Promise<void> {
        this.logger.info('%%%', {
            nameMatchResults
        });
    }

    async executeCollection(nameMatchResults: MatchName.MatchResults[]): Promise<void> {
        this.logger.info('%%%', {
            nameMatchResults
        });
    }
};