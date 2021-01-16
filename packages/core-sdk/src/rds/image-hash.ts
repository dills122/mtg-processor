import Base from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface IImageHash {

};

export interface IGetHash {
    artImage: string,
    flavorImage: string,
    artImageHash: string,
    flavorImagHash: string,
    flavorMatchPercent: string | number,
    artMatchPercent: string | number
};

export default class ImageHash extends Base {
    constructor(args) {
        super(args);
    }

    async insert(record) {
        try {
            logger.info(`Inserting record into Image Results table`);
            return await this.query<IImageHash>('INSERT INTO Image_Results SET ?', record);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getHashes(name: string, set: string) {
        try {
            logger.info(`Getting hash record from Image Results table`);
            return await this.query<Array<IImageHash>>('SELECT ArtImage as artImage, FlavorImage as flavorImage, ArtImageHash as artImageHash, FlavorImageHash as flavorImageHash, FlavorMatchPercent as flavorMatchPercent, ArtMatchPercent as artMatchPercent FROM Image_Results WHERE Name=? AND SetName=?', [name, set]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};