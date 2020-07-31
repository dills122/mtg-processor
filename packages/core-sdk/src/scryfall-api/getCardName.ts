import request from 'request-promise-native';
import config from '../config';
import _ from 'lodash';
import Logger from '../logger/log'
const logger = new Logger({
    isPretty: true
});
export const dependencies = {
    request
};

export default {
    GetCardNames,
    dependencies
}

export async function GetCardNames() {
    try {
        let response = await dependencies.request(`${config.api.scryfall.base}/catalog/card-names`);
        if (!response || _.isEmpty(response)) {
            throw new Error('Unable to contact endpoint, no response');
        }
        const resp: any = JSON.parse(response);
        const names: string[] = resp.data;
        if (names.length <= 0) {
            throw new Error('No names were found, this is unusual');
        }
        return names;
    } catch (err) {
        logger.error(err);
        throw err;
    }
};