const async = require("async");
const _ = require('lodash');
const joi = require("@hapi/joi");

const {
    default: Logger
} = require('../logger/log');
const dependencies = {
    resize: require('./resize'),
    textExtraction: require("../image-analysis").default.textExtraction
};
const schema = joi.object().keys({
    path: joi.string().required(),
    type: joi.string().required(),
    directory: joi.string().required(),
    logger: joi.object().optional()
});

class ImageProcessor {
    constructor(params = {}) {
        let validatedSchema = joi.attempt(params, schema);
        _.assign(this, validatedSchema);
        if (!this.logger) {
            this.logger = new Logger({
                isPretty: false
            });
        }
    }

    extract(callback) {
        async.waterfall([
            (next) => this.cropImage(next),
            (next) => this.extractText(next)
        ], callback);
    }

    cropImage(callback) {
        dependencies.resize.GetImageSnippetTmpFile(this.path, this.directory, this.type).then((imgPath) => {
            this.imagePath = imgPath;
            return callback();
        }).catch((err) => {
            return callback(err);
        });
    }

    extractText(callback) {
        dependencies.textExtraction.ScanImage(this.imagePath).then((extractResults) => {
            this.results = extractResults;
            return callback(null, this.results);
        }).catch((err) => {
            return callback(err);
        });
    }
}

module.exports = {
    create: function (params) {
        return new ImageProcessor(params);
    },
    dependencies
};