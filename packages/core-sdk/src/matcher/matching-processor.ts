import yup from 'yup';
import _ from 'lodash';
import Logger from '../logger/log';
import { Search } from '../scryfall-api';
import { Hash } from '../image-hashing';
import { HashComparer } from '../hash-comparer';

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

    async execute() {
        try {
            this.cardObjects = await dependencies.Searcher(this.cardName);
            switch (this.cardObjects.length) {
                case 0:
                    return null;
                case 1:
                    return this.cardObjects[0];
                default:
                    await this.hashLocalCard();
            }
        } catch (err) {

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
            //TODO finish refactoring this
            //The hash results are here now
            await hashComparer.compare('remote');
            await hashComparer.compare('database');
        } catch (err) {

        }
    }

    processHashResults(hashResults, callback) {
        if (_.isEmpty(hashResults)) {
            return callback(null, []); //No set to return
        }

        if (hashResults.length > 1) {
            return callback(null, _.map(hashResults, "setName"));
        }
        let matchObject = hashResults[0] || {};
        return callback(null, [_.get(matchObject, "setName", "")]);
    }
};