import request from 'request-promise-native';
import Logger from '../logger/log';
import config from '../config';
import _ from 'lodash';
const logger = new Logger({
    isPretty: true
});
export const dependencies = {
    request
};

export default {
    SearchByNameExact,
    SearchList,
    dependencies
};

export async function SearchByNameExact(exact) {
    try {
        let response = await dependencies.request(encodeURI(`${config.api.scryfall.templates.cardNameExact}${exact}`));
        if (!response || _.isEmpty(response)) {
            throw new Error('Unable to contact endpoint, no response');
        }
        console.log('response');
        console.log(response);
        const resp: any = JSON.parse(response);
        console.log(resp);
        const cards: Array<any> = resp.data;
        if (cards.length <= 0) {
            return [];
        }
        return cards;
    } catch (err) {
        logger.error(err);
        throw err;
    }
}

export async function SearchList(exact) {
    let name = exact.replace(/ /g, '%20');
    try {
        let response = await dependencies.request(`${config.api.scryfall.templates.cardListExact}${name}&unique=prints`);
        if (!response || _.isEmpty(response)) {
            throw new Error('Unable to contact endpoint, no response');
        }
        const resp: any = JSON.parse(response);
        const cards: Array<any> = resp.data;
        if (cards.length <= 0) {
            return [];
        }
        return cards;
    } catch (err) {
        logger.error(err);
        throw err;
    }
};
