import _ from 'lodash';
import yup from 'yup';
import uuid from 'uuid/v4'
import Collection, { CardCollectionModel, CollectionSearchParameters, CollectionUpdateParameters } from '../rds/collection';

const schema = yup.object().shape({
    cardId: yup.number(),
    cardName: yup.string().min(3).max(50).required(),
    cardType: yup.string().min(3).max(50).required(),
    cardSet: yup.string().min(3).max(50).required(),
    quantity: yup.number().min(1).required(),
    estValue: yup.number().optional(),
    automated: yup.bool(),
    magicId: yup.number().min(1).required(),
    imageUrl: yup.string().min(3).max(150).required(),
});

export interface CardCollectionArgs {

};

export default class CardCollection {
    collectionInst: Collection;
    private _model: CardCollectionModel;
    constructor(args?: CardCollectionArgs) {
        _.assign(this, args);
        this.collectionInst = new Collection();
    }

    async Create(model: CardCollectionModel) {
        try {
            const validatedModel = await schema.isValid({
                cardId: uuid(),
                ...model
            });
            await this.collectionInst.insert(validatedModel);
            await this.Read({
                cardName: model.cardName,
                cardSet: model.cardSet
            });
        } catch (err) {
            throw err;
        }
    }

    async Read(searchParameters: CollectionSearchParameters) {
        try {
            this._model = await this.collectionInst.get(searchParameters);
            return this._model;
        } catch (err) {
            throw err;
        }
    }

    Get() {
        if (!this._model) {
            throw Error('No model available to retrieve');
        }
        return this._model;
    }

    async Update(searchParameters: CollectionSearchParameters, updateParameters: CollectionUpdateParameters) {
        try {
            await this.collectionInst.update(searchParameters, updateParameters);
            await this.Read(searchParameters);
        } catch (err) {
            throw err;
        }
    }
};

