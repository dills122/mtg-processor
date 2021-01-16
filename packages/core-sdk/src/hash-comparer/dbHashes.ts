import { Hash } from '../image-hashing';
import config from '../config';
const { storedHash: storedMatchConst } = config.matchConstants;

const dependencies = {
    Hash
};

export interface HashComparisonResults {
    setName: string,
    twoBitMatches: number,
    fourBitMatches: number,
    stringCompare: number
};

export default function compareDbHashes({
    hashes,
    localHash
}) {
    let matches: Array<HashComparisonResults> = [];
    hashes.forEach((dbHash) => {
        let compareResults = dependencies.Hash.compareHash(localHash, dbHash.cardHash);
        //TODO move to config
        let isMatch = compareResults.twoBitMatches >= storedMatchConst.twoBit &&
            compareResults.fourBitMatches >= storedMatchConst.fourBit &&
            compareResults.stringCompare >= storedMatchConst.stringCompare;
        if (!isMatch) {
            return;
        }
        matches.push({
            setName: dbHash.setName,
            ...compareResults
        });
    });
    return matches;
}