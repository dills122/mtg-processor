import Base from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface INeedsAttention {

};

export default class NeedsAttention extends Base {
    constructor(args) {
        super(args);
    }

    async insert(record) {
        try {
            logger.info(`Inserting record into Needs Attention table`);
            return await this.query<INeedsAttention>('INSERT INTO Card_NEED_ATTN SET ?', record);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};
