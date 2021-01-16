import _ from 'lodash';
import FuzzySet from 'fuzzyset.js';
import Logger from '../logger/log';
import { GetNames } from '../db-local';

const config = {
    highConfidence: .95,
    minConfidence: .70,
    maxMatches: 5
};

export const dependencies = {
    GetNames: GetNames.GetBulkNames
};

export function filterNames(names: Array<NameRecords>): Array<string> {
    return names.map((record) => {
        return record.name;
    });
}

export default class MatchName {
    logger: Logger;
    cleanText: string;
    dirtyText: string;
    initialResults: FuzzySetResults;
    isPretty: boolean;
    filteredMatchResults: MatchResults[];

    constructor(args: MatchNameArgs) {
        _.assign(this, args);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: this.isPretty
            });
        }
    }

    async Match(): Promise<Array<MatchResults>> {
        try {
            await this.gatherInitialResults();
            const mappedMatchResults = this.remapFuzzyData();
            this.filteredMatchResults = this.filterBulkMatches(mappedMatchResults);
            return this.filteredMatchResults;
        } catch (err) {
            this.logger.error(err);
            return [];
        }
    }

    async gatherInitialResults() {
        try {
            const names = await dependencies.GetNames();
            let filteredNames = filterNames(names);
            if (!filterNames || _.isEmpty(filteredNames)) {
                throw Error('No Names found to add to fuzzy set');
            }
            let fuzzy = FuzzySet(filteredNames);
            this.initialResults = fuzzy.get(this.cleanText);
        } catch (err) {
            throw err;
        }
    }

    remapFuzzyData(initialResults?: FuzzySetResults) {
        return _.map(initialResults || this.initialResults, (match) => {
            let [namePercent, nameMatch] = match;
            return {
                name: String(nameMatch),
                percentage: namePercent
            };
        });
    }

    filterBulkMatches(matchData: Array<MatchResults>) {
        let highConfidenceMatches = _.filter(matchData, (item) => {
            return Number(item.percentage) >= config.highConfidence;
        });

        if (highConfidenceMatches.length > 1) {
            return highConfidenceMatches.splice(0, config.maxMatches + 1);
        }
        let lesserMatches = _.filter(matchData, (item) => {
            return Number(item.percentage) >= config.minConfidence;
        });
        return lesserMatches;
    }
};

type FuzzySetResults = Array<Array<number | string>> | null;

export interface NameRecords {
    name: string;
};

export interface MatchResults {
    name: string,
    percentage: string | number
};

export interface MatchNameArgs {
    cleanText: string,
    dirtyText?: string,
    logger?: Logger,
    isPretty?: boolean
};