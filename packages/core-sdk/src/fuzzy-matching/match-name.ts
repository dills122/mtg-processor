import _ from 'lodash';
import async from 'async';
import joi from '@hapi/joi';
import FuzzySet from 'fuzzyset.js';
import Logger from '../logger/log';
const GetBulkNames = require('../db-local/index').GetBulkNames;

const config = {
    highConfidence: .95,
    minConfidence: .70,
    maxMatches: 5
};

export const dependencies = {
    GetNames: GetBulkNames
};

const schema = joi.object().keys({
    cleanText: joi.string().required(),
    dirtyText: joi.string().optional(),
    logger: joi.object().optional()
});

export function filterNames(names: Array<NameRecords>): Array<string> {
    return names.map((record) => {
        return record.name;
    });
}

export default class MatchName {
    logger: Logger;
    cleanText: string;
    dirtyText: string;
    initialResults: Array<Array<number | string>> | null;
    finalResults: { name: string | number; percentage: string | number; }[];

    constructor(params) {
        let validated = joi.attempt(params, schema);
        _.assign(this, validated);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    async Match(): Promise<MatchResults | Array<MatchResults>> {
        return new Promise((resolve, reject) => {
            async.waterfall([
                (next) => this.gatherInitialResults(next),
                (next) => this.filterBulkMatches(next),
            ], (err) => {
                if (err) {
                    return reject(err);
                }
                if(this.finalResults) {
                    return resolve(this.finalResults);
                }
            });
        });
    }

    gatherInitialResults(callback) {
        dependencies.GetNames((err, names) => {
            if (err) {
                return callback(err);
            }
            let filteredNames = filterNames(names);
            if(!filterNames || _.isEmpty(filteredNames)) {
                return callback(new Error('No Names found to add to fuzzy set'));
            }
            let fuzzy = FuzzySet(filteredNames);
            this.initialResults = fuzzy.get(this.cleanText);
            return callback();
        });
    }

    filterBulkMatches(callback): void {
        let fixedResults = _.map(this.initialResults, (match) => {
            let [namePercent, nameMatch] = match;
            return {
                name: nameMatch,
                percentage: namePercent
            };
        });

        let highConfidenceMatches = _.filter(fixedResults, (item) => {
            return Number(item.percentage) >= config.highConfidence;
        });

        if (highConfidenceMatches.length > 1) {
            return callback(null, highConfidenceMatches.splice(0, config.maxMatches + 1));
        }
        this.finalResults = _.filter(fixedResults, (item) => {
            return Number(item.percentage) >= config.minConfidence;
        }).splice(0, config.maxMatches + 1);
        return callback(null, this.finalResults);
    }
}

export interface NameRecords {
    name: string;
};

export interface MatchResults {
    name: string | number,
    percentage: string | number
};