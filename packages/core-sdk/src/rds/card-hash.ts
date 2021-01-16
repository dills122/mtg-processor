import Base from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface ICardHashes {

};

export interface IGetHashes {
    cardHash: string,
    setName: string,
    isFoil: string | boolean,
    isPromo: string | boolean
};

export default class CardHash extends Base {
    constructor(args?) {
        super(args);
    }

    async insert(record) {
        try {
            logger.info(`Inserting record into card hashes table`);
            return await this.query<ICardHashes>('INSERT INTO Card_Hashes SET ?', record);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getHashes(name: string) {
        try {
            logger.info(`Getting card hash records from card hashes table`);
            return await this.query<Array<IGetHashes>>('SELECT CardHash as cardHash, SetName as setName, IsFoil as isFoil, IsPromo as isPromo FROM Card_Hashes WHERE CardName=?', [name]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};
