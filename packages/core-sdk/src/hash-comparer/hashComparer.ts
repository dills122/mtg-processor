import _ from 'lodash';
import Logger from '../logger/log';
import yup from 'yup';
import { Hash } from '../image-hashing';
import { CardHash } from '../rds/';
import compareDatabaseHashes from './dbHashes';
import compareRemoteHash, { HashComparisonResults } from './remoteHashes';

const dependencies = {
    Hash,
    CardHash
};

const schema = yup.object().shape({
    cards: yup.array().min(1).required(),
    localHash: yup.string().min(1).required(),
    name: yup.string().required(),
    queryingEnabled: yup.boolean().optional().default(false)
});

export interface HashComparerArgs {
    cards: Array<any>, //TODO update with real interface type
    localHash: string,
    cardName: string,
    queryingEnabled?: boolean,
    logger?: Logger
};

export default class HashComparer {
    logger: Logger;
    cards: Array<any> //TODO update this too
    localHash: string;
    cardName: string;
    private _queryingEnabled: boolean;
    constructor(args: HashComparerArgs) {
        const isValid = schema.isValidSync(args);
        if (!isValid) {
            throw Error('Schema missing required parameters');
        }
        _.assign(this, args);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: true
            });
        }
    }

    async compare(type: 'remote' | 'database') {
        try {
            if (type === 'remote') {
                return await this.compareRemote();
            }
            return await this.compareDatabase();
        } catch (err) {
            this.logger.error('Unable to process hash comparison', {
                type,
                cardName: this.cardName,
                localHash: this.localHash
            });
            return [];
        }
    }

    async compareDatabase() {
        try {
            const hashes = await new dependencies.CardHash().getHashes(this.cardName);
            return compareDatabaseHashes({
                hashes,
                localHash: this.localHash
            });
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async compareRemote() {
        try {
            //TODO move to util and update type 
            let cards: Array<{
                imgUrl: string,
                setName: string
            }> = _.map(this.cards, function (card) {
                let images = card.image_uris || {};
                return {
                    imgUrl: images.normal || images.large,
                    setName: card.set_name
                }
            });
            let matches: Array<HashComparisonResults> = [];
            await Promise.all(cards.map(async (card) => {
                const { imgUrl, setName } = card;
                const remoteHash = await dependencies.Hash.hashImage(imgUrl);
                await this._insertCardHash({
                    setName,
                    hash: remoteHash
                });
                const remoteHashComparisonResults = compareRemoteHash({
                    remoteSetName: setName,
                    remoteHash,
                    localHash: this.localHash
                });
                if (remoteHashComparisonResults) {
                    matches.push(remoteHashComparisonResults);
                }
            }));
            return matches;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async _insertCardHash({
        setName,
        hash
    }) {
        try {
            await new dependencies.CardHash().insert({
                Name: this.cardName,
                SetName: setName,
                CardHash: hash
            });
        } catch (err) {
            this.logger.error(err);
            return;
        }
    }
}