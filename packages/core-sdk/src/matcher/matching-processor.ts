import yup from 'yup';
import _ from 'lodash';
import Logger from '../logger/log';
import { Search } from '../scryfall-api';
import { Hash } from '../image-hashing';
import { HashComparer } from '../hash-comparer';
import { HashComparisonResults } from '../hash-comparer/remoteHashes';

const dependencies = {
    Searcher: Search.SearchList,
    HashComparer,
    Hash: Hash
};

const schema = yup.object().shape({
    cardName: yup.string().required(),
    file: yup.object().required()
});

export interface MatcherProcessorArgs {
    cardName: string,
    file: Buffer,
    logger?: Logger
};

export default class MatcherProcessor {
    logger: Logger;
    cardName: string;
    file: Buffer;
    cardObjects: any[];
    localHash: string;
    matchResults: Set<unknown>; //TODO update this
    constructor(args: MatcherProcessorArgs) {
        let isValid = schema.isValidSync(args);
        if (!isValid) {
            throw new Error("Schema missing required parameters");
        }
        _.assign(this, args);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    //TODO this output should be updated to export more data from the API call on the final result
    async execute() {
        try {
            this.cardObjects = await dependencies.Searcher(this.cardName);
            switch (this.cardObjects.length) {
                case 0:
                    return [];
                case 1:
                    //TODO this needs updated for proper mapping
                    return this.mapFinalResults([this.cardObjects[0]]);
                default:
                    await this.hashLocalCard();
                    return await this.processMultiSetMatches();
            }
        } catch (err) {
            this.logger.error(err);
            return [];
        }
    }

    async hashLocalCard() {
        try {
            this.logger.info(`Hashing local image ${this.cardName}`)
            this.localHash = await dependencies.Hash.hashImage(this.file);
        } catch (err) {
            throw err;
        }
    }

    async processMultiSetMatches() {
        try {
            const hashComparer = new dependencies.HashComparer({
                cardName: this.cardName,
                cards: this.cardObjects,
                localHash: this.localHash,
                logger: this.logger
            });
            const remoteHashResults = await hashComparer.compare('remote');
            if (remoteHashResults.length === 1) {
                return this.mapFinalResults([remoteHashResults[0]]);
            }
            const databaseHashResults = await hashComparer.compare('database');
            const filteredResults = _.uniqBy([...remoteHashResults, ...databaseHashResults], 'setName');
            if (filteredResults.length <= 0) {
                return [];
            }
            return this.mapFinalResults(filteredResults);
        } catch (err) {
            this.logger.error(err);
            return [];
        }
    }

    mapFinalResults(collection: Array<HashComparisonResults>) {
        return _.map(collection, 'setName');
    }
};