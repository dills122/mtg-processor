import Base, { RDSBaseArgs } from './rds-base';
import Logger from '../logger/log';

const logger = new Logger({
    isPretty: true
});

export interface CollectionSearchParameters {
    cardName: string,
    cardSet: string
};

export interface CollectionUpdateParameters {
    estValue: number,
    quantity: number
};

export interface CardCollectionModel {
    cardId?: number,
    cardName: string,
    cardType: string,
    cardSet: string,
    quantity: number,
    estValue?: number,
    automated?: boolean,
    magicId: number,
    imageUrl: string,
    imageType: string
};
interface CardCollectionDatabaseModel {
    CardID: number,
    CardName: string,
    CardType: string,
    CardSet: string,
    Quantity: number,
    EstValue: number,
    Automated: boolean,
    MagicID: number,
    ImageUrl: string,
    ImageType: string,
    CreatedAt: string,
    UpdatedAt: string
};

export interface ICollection {

};

export interface IGetQty {
    Quantity: string | number
};

export default class Collection extends Base {
    constructor(args: RDSBaseArgs = {}) {
        super(args);
    }

    async insert(record) {
        try {
            logger.info(`Inserting record into card catalog table`);
            return await this.query<ICollection>('INSERT INTO Card_Catalog SET ?', record);
        } catch (err) {
            logger.error(err);
            throw Error('Unable to insert record into DB');
        }
    }

    async update(searchParameters: CollectionSearchParameters, updateParameters: CollectionUpdateParameters) {
        try {
            logger.info('Updating record', {
                ...searchParameters,
                ...updateParameters
            })
            await this.query<ICollection>('UPDATE Card_Catalog SET Quantity = ?, EstValue = ? WHERE CardName = ? AND CardSet = ?', 
            [updateParameters.quantity, updateParameters.estValue, searchParameters.cardName, searchParameters.cardSet]);
        } catch (err) {
            logger.error(err);
            throw Error('Unable to update record in db');
        }
    }

    async get(searchParameters: CollectionSearchParameters) {
        try {
            logger.info('Getting record with the given search parameters', searchParameters);
            const dbModel = await this.query<CardCollectionDatabaseModel>('SELECT * FROM Card_Catalog WHERE CardName=? AND CardSet=?', [searchParameters.cardName, searchParameters.cardSet])
            return convertFromDbtoModelSchema(dbModel);
        } catch (err) {
            logger.error(err);
            throw Error('Unable to retrieve record from db');
        }
    }

    async getQty(searchParameters: CollectionSearchParameters): Promise<number> {
        try {
            logger.info(`Getting hash record from card catalog table`);
            const collectionRecord = await this.get(searchParameters);
            return collectionRecord.quantity;
        } catch (err) {
            logger.error(err);
            throw Error('Unable to get quantity from db');
        }
    }
};

export function convertFromDbtoModelSchema(dbModel: CardCollectionDatabaseModel): CardCollectionModel {
    return {
        cardId: dbModel.CardID,
        cardName: dbModel.CardName,
        cardType: dbModel.CardType,
        cardSet: dbModel.CardSet,
        quantity: dbModel.Quantity,
        estValue: dbModel.EstValue,
        automated: dbModel.Automated,
        magicId: dbModel.MagicID,
        imageUrl: dbModel.ImageUrl,
        imageType: dbModel.ImageType
    };
}