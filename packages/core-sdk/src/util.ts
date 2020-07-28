const txtUtil = require("clean-text-utils");
import Logger from './logger/log';
const logger = new Logger({
    isPretty: true
});

export function cleanString(string: string): string {
    let cleanedString = txtUtil.strip.extraSpace(string);
    cleanedString = txtUtil.strip.newlines(string);
    cleanedString = txtUtil.strip.punctuation(string);
    return cleanedString;
}

export function requireF(modulePath): NodeModule | false { // force require
    try {
        return require(modulePath);
    } catch (e) {
        logger.error('requireF(): The file "' + modulePath + '".js could not be loaded.');
        return false;
    }
}