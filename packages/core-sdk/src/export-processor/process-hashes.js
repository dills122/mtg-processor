const _ = require('lodash');
const async = require("async");
const {
    default: Logger
} = require('../logger/log');

const joi = require("@hapi/joi");
const config = require('../config').default;

const dependencies = {
    CardHashes: require("../rds").default.CardHash,
    Hash: require("../image-hashing").default.Hash
};

const schema = joi.object().keys({
    cards: joi.array().min(1).required(),
    localHash: joi.string().min(1).required(),
    name: joi.string().required(),
    queryingEnabled: joi.boolean().optional().default(false)
});

class ProcessHashes {
    constructor(params = {}) {
        let validatedSchema = joi.attempt(params, schema);
        _.assign(this, validatedSchema);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: true
            });
        }
    }

    compareDbHashes(callback) {
        this.logger.info(`process-hashes::compareDbHashes: Compare DB Hashes`);
        const hashes = new dependencies.CardHashes();
        hashes.getHashes(this.name).then((hashes) => {
            let matches = [];
            hashes.forEach((dbHash) => {
                let compareResults = dependencies.Hash.compareHash(this.localHash, dbHash.cardHash);
                let isMatch = compareResults.twoBitMatches >= .92 &&
                    compareResults.fourBitMatches >= .88 &&
                    compareResults.stringCompare >= .92;
                if (isMatch) {
                    matches.push(Object.assign(compareResults, {
                        setName: dbHash.setName
                    }));
                }
            });
            this.logger.info(matches);
            if (matches.length === 0) {
                this.logger.info(`process-hashes::compareDbHashes: No DB Hash Match Found ${this.name}`);
                return callback({
                    error: 'No Matches Found'
                });
            }
            return callback(null, matches);
        }).catch((err) => {
            return callback(err);
        });
    }

    compareRemoteImages(callback) {
        this.logger.info(`process-hashes::compareDbHashes: Compare Remote Image Hashes`);
        let cards = _.map(this.cards, function (card) {
            let images = card.image_uris || {};
            return {
                imgUrl: images.normal || images.large,
                setName: card.set_name
            }
        });
        let comparisonResultsList = [];
        async.each(cards, (card, cb) => {
            const { url, setName } = card;
            dependencies.Hash.hashImage(url).then((remoteImageHash) => {
                this._insertCardHash(remoteImageHash, setName);
                let comparisonResults = dependencies.Hash.compareHash(this.localHash, remoteImageHash);
                if (!_.isEmpty(comparisonResults)) {
                    comparisonResultsList.push(Object.assign(comparisonResults, {
                        setName
                    }));
                }
                return cb();
            }).catch((err) => {
                if (err) {
                    return cb(err);
                }
            });
        }, (err) => {
            if (err) {
                return callback(err);
            }
            let matchValues = config.matchConstants.remote;
            let bestMatches = _.filter(comparisonResultsList, function (match) {
                return match.twoBitMatches >= matchValues.twoBit &&
                    match.fourBitMatches >= matchValues.fourBit &&
                    match.stringCompare >= matchValues.stringCompare;
            });
            return callback(null, bestMatches);
        });
    }

    _insertCardHash() {
        if (this.queryingEnabled) {
            CardHashes.InsertEntity({
                Name: this.name,
                SetName: setName,
                CardHash: hash
            });
        }
    }
}

module.exports = {
    create: function (params) {
        return new ProcessHashes(params);
    },
    prototype: ProcessHashes.prototype
}