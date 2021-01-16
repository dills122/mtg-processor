import yup from 'yup';
import _ from 'lodash';
import Logger from '../logger/log';
import { Search } from '../scryfall-api';
import { Hash } from '../image-hashing';
import async from 'async';
const ProcessHashes = require('../export-processor');

const dependencies = {
    Searcher: Search.SearchList,
    HashProcessor: ProcessHashes,
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
        return new Promise((resolve, reject) => {
            let processHashes = dependencies.HashProcessor.create({
                name: this.cardName,
                cards: this.cardObjects,
                localHash: this.localHash,
                queryingEnabled: false //TODO overhaul this 
            });
            this.logger.info("Processing multi set matches");
            //TODO refactor the hash processor to get rid of async lib
            async.parallel([
                (cb) => {
                    async.waterfall([
                        (next) => processHashes.compareDbHashes(next),
                        this.processHashResults
                    ], cb);
                },
                (cb) => {
                    async.waterfall([
                        (next) => processHashes.compareRemoteImages(next),
                        this.processHashResults
                    ], cb);
                }
            ], (err, finalResults) => {
                if (err) {
                    return reject(err);
                }
                let [db, remote] = finalResults;
                let mergedResults = db.concat(remote);
                this.matchResults = new Set(mergedResults);

                return resolve(this.matchResults);
            });
        });
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