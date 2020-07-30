import _ from 'lodash';
import FuzzySet from 'fuzzyset.js';
import Logger from '../logger/log';
const Types = {
    creature: require('../data/creatureTypes'),
    card: require('../data/cardTypes')
};

//TODO Move this out after dev done
const MatchConstants = {
    baseMatchPercentage: 50,
    betterMatchPercentage: 65,
    bestMatchPercentage: 75
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
    };

    match(inputStr: string): { name: string, matchPercentage: number } | {} {
        if (!inputStr || _.isEmpty(inputStr)) {
            throw new Error('No input string provided, nothing to match aganist');
        }
        try {
            this.matchString = inputStr;
            this.executeMatchers(inputStr);
            const filteredResults = this.filterResults();
            if (Object.keys(filteredResults).length > 0) {
                return filteredResults;
            }
            if (_.isArray(filteredResults) && filteredResults.length > 0) {
                const first = _.first(filteredResults);
                return {
                    name: first?.name,
                    matchPercentage: first?.percentage
                }
            }
            return filteredResults;
        } catch (err) {
            return {};
        }
    }

    executeMatchers(matchStr: string) {
        Object.keys(Types).forEach((key, _index, array) => {
            const fuzzy = FuzzySet(array[key]);
            const fullNameResults = {
                str: matchStr,
                results: fuzzy.get(matchStr)
            };

            const partialNameMatches = _.map(matchStr.split(' '), (partialStr) => {
                return {
                    str: partialStr,
                    results: fuzzy.get(partialStr)
                }
            }).values();

            this.matches.concat([fullNameResults, ...partialNameMatches].map((match) => {
                const remappedMatches = match.results?.map((idvMatch) => {
                    const [percentage, name] = idvMatch;
                    return {
                        percentage,
                        name
                    };
                })
                return {
                    str: match.str,
                    results: remappedMatches
                }
            }));
        });
        return this.matches;
    }

    filterResults(): Array<{ str: string, name: string, percentage: string | number }> | Error {
        if (_.isEmpty(this.matches)) {
            return new Error('No results to filter');
        }
        this.matches.map((match) => {
            let filteredInnerResults: { percentage: number; name: string; }[] = [];
            const { results } = match;
            filteredInnerResults = this.runAganistMatchThresholds(results);
            const { name, percentage } = _.chain(filteredInnerResults).sortBy(['percentage']).first().value();
            return {
                str: match.str,
                name,
                percentage
            };
        });
        return this.runAganistMatchThresholds(this.matches);
    }

    runAganistMatchThresholds(results) {
        let filteredInnerResults: any[] = [];
        Reflect.ownKeys(MatchConstants).some((key, _index, array) => {
            const threshold = array[key];
            const filteredMatchResults = _.filter(results, (obj) => {
                return threshold <= obj.percentage;
            });
            if (!_.isEmpty(filteredMatchResults)) {
                filteredInnerResults.concat(filteredMatchResults);
                return true;
            }
            return false;
        });
        return filteredInnerResults;
    }
};