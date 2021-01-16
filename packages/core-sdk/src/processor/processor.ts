import _ from 'lodash';
import Logger from '../logger/log';
import { ImageProcessor } from '../image-processing';
import { MatchName } from '../fuzzy-matching';

const dependencies = {
    ImageProcessor,
    MatchName: MatchName.default
};

export interface ProcessorArgs {
    file: Buffer,
    logger?: Logger
};

export default class Processor {
    logger: Logger;
    file: Buffer;
    nameMatchResults: MatchName.MatchResults[] = [];

    constructor(args : ProcessorArgs) {
        _.assign(this, args);
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
            this.nameMatchResults = await new dependencies.MatchName({
                cleanText: nameExtractionResults.cleanText,
                logger: this.logger
            }).Match();
            if (this.nameMatchResults.length <= 0) {
                this.logger.warn('Unable to gather any match results', {
                    ...nameExtractionResults
                });
                return;
            }
            if (this.nameMatchResults.length > 1) {
                this.logger.info('Found multiple name match results, executing needs attention route', {
                    ...nameExtractionResults,
                    nameMatchResults: this.nameMatchResults
                });
                return await this.executeNeedsAttention(this.nameMatchResults);
            }
            this.logger.info('Found single name match, executing collection route', {
                ...nameExtractionResults,
                nameMatchResults: this.nameMatchResults
            });
            return await this.executeCollection(this.nameMatchResults);
        } catch (err) {
            this.logger.error('Error processing card', err);
            // process.exit(1);
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