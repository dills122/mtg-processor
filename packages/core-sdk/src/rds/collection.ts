import Base from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface ICollection {

};

export interface IGetQty {
    Quantity: string | number
};

export default class Collection extends Base {
    constructor(args) {
        super(args);
    }

    async insert(record) {
        try {
            logger.info(`Inserting record into card catalog table`);
            return await this.query<ICollection>('INSERT INTO Card_Catalog SET ?', record);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getQty(name: string, set: string) {
        try {
            logger.info(`Getting hash record from card catalog table`);
            return await this.query<Array<IGetQty>>('SELECT Quantity FROM Card_Catalog WHERE CardName=? AND CardSet=?', [name, set]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};
