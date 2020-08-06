import Base from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface ITransaction {

};

export default class Transaction extends Base {
    constructor(args) {
        super(args);
    } 

    async insert(record) {
        try {
            logger.info(`Inserting record into Transaction table`);
            return await this.query<ITransaction>('INSERT INTO Transactions SET ?', record);
        } catch(err) {
            logger.error(err);
            throw err;
        }
    }
};