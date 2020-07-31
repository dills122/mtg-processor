import _ from 'lodash';
import FuzzySet from 'fuzzyset.js';
import { remapFuzzyResults } from './util';
import Logger from '../logger/log';
import config from '../config';
const Types = {
    creature: require('../data/creatureTypes'),
    card: require('../data/cardTypes')
};
const MatchConstants = config.fuzzyMatching.matchConstants;

export const dependencies = {
    Types
};

export default class MatchType {
    matchString: string;
    matches: { str: string; results: { percentage: number; name: string; }[] | undefined; }[];
    logger: Logger;
    constructor() {
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
        this.matches = [];
    };

    match(inputStr: string): { name: string, matchPercentage: number } | {} {
        if (!inputStr || _.isEmpty(inputStr)) {
            throw new Error('No input string provided, nothing to match aganist');
        }
        try {
            this.matchString = inputStr;
            this.executeMatchers(inputStr);
            const filteredResults = this.filterResults();
            if (filteredResults.length > 0) {
                const first = _.first(filteredResults);
                return {
                    name: first?.name,
                    matchPercentage: first?.percentage
                }
            }
            return {};
        } catch (err) {
            console.log(err);
            return {};
        }
    }

    executeMatchers(matchStr: string) {
        for (const key of Object.keys(dependencies.Types)) {
            const fuzzy = FuzzySet(dependencies.Types[key]);
            const results = remapFuzzyResults(fuzzy.get(matchStr));
            if (results.length > 0) {
                this.matches.push({
                    str: matchStr,
                    results
                });
            }
            const partialNames = matchStr.split(' ');
            if (partialNames.length > 1) {
                const partialNameMatches = this.runPartialNameMatchers(partialNames, fuzzy);
                this.matches.push(...partialNameMatches);
            }
        }
        return this.matches;
    }

    runPartialNameMatchers(partialNames: string[], fuzzy: FuzzySet) {
        return partialNames.map((partialStr) => {
            const partialFuzzyResults = remapFuzzyResults(fuzzy.get(partialStr));
            return {
                str: partialStr,
                results: partialFuzzyResults
            }
        });
    }

    filterResults(): Array<{ name: string, percentage: number }> {
        const arry: Array<{ str: string, name: string, percentage: number }> = [];
        if (!this.matches || _.isEmpty(this.matches)) {
            throw new Error('No results to filter');
        }
        for (let i = 0; i < this.matches.length; i++) {
            const { results, str } = this.matches[i];
            if (!results) {
                continue;
            }
            const filteredInnerResults = this.runAganistMatchThresholds(results);
            if (filteredInnerResults.length > 0) {
                const { name, percentage } = _.chain(filteredInnerResults).orderBy(['percentage']).first().value();
                arry.push({
                    str,
                    name,
                    percentage
                });
            }
        }
        return _.orderBy(this.runAganistMatchThresholds(arry), ['percentage'], ['desc']);
    }

    runAganistMatchThresholds(results: Array<{ name: string, percentage: number }>): Array<{ name: string, percentage: number }> {
        let filteredInnerResults: Array<{ name: string, percentage: number }> = [];
        Reflect.ownKeys(MatchConstants).some((key) => {
            const threshold = MatchConstants[key];
            const filteredMatchResults = _.filter(results, (obj) => {
                return threshold <= obj.percentage;
            });
            if (filteredMatchResults.length > 0) {
                filteredInnerResults.push(...filteredMatchResults);
                return true;
            }
            return false;
        });
        return filteredInnerResults;
    }
};