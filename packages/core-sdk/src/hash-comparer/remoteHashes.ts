import { Hash } from '../image-hashing';
import config from '../config';
const { remote: remoteMatchConst } = config.matchConstants;

const dependencies = {
    Hash
};

export interface HashComparisonResults {
    setName: string,
    twoBitMatches: number,
    fourBitMatches: number,
    stringCompare: number
};

export default function compareRemoteHash({
    remoteHash,
    localHash,
    remoteSetName
}) {
    let compareResults = dependencies.Hash.compareHash(localHash, remoteHash);
    //TODO move to config
    let isMatch = compareResults.twoBitMatches >= remoteMatchConst.twoBit &&
        compareResults.fourBitMatches >= remoteMatchConst.fourBit &&
        compareResults.stringCompare >= remoteMatchConst.stringCompare;
    if (!isMatch) {
        return;
    }
    return {
        setName: remoteSetName,
        ...compareResults
    };
}