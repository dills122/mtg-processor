import sinon from 'sinon';
import { expect, assert } from 'chai';
import api from '../../src/scryfall-api/';
const { GetCardNames, Search } = api;

describe('Srcyfall Api::', () => {
    describe('::searchName::', () => {
        let json = {
            "object": "list",
            "total_cards": 445,
            "has_more": true,
            "next_page": "https://api.scryfall.com/cards/search?format=json&include_extras=false&include_multilingual=false&order=cmc&page=2&q=c%3Ared+pow%3D3&unique=cards",
            "data": [{}]
        };
        let stubs: any = {};
        let sandbox = sinon.createSandbox();
        beforeEach(() => {
            stubs.requestStub = sandbox.stub(Search.dependencies, 'request').resolves(JSON.stringify(json));
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('SearchByNameExact', (done) => {
            Search.SearchByNameExact('Fake Name').then((card) => {
                assert.isTrue(stubs.requestStub.calledOnce);
                assert(card);
                expect(card).to.be.an('array').and.length(1);
                return done();
            }).catch((err) => {
                return done(err);
            });

        });
        it('SearchList', (done) => {
            Search.SearchList('Fake Name').then((cards) => {
                assert.isTrue(stubs.requestStub.calledOnce);
                assert(cards);
                expect(cards).to.be.an('array').and.length(1);
                const card = cards[0];
                expect(card).to.be.an('object');
                assert.deepEqual(card, {});
                return done();
            }).catch((err) => {
                done(err);
            });
        });
    });
    describe('::getCardName::', () => {
        let json = {
            "object": "list",
            "total_cards": 445,
            "has_more": true,
            "next_page": "https://api.scryfall.com/cards/search?format=json&include_extras=false&include_multilingual=false&order=cmc&page=2&q=c%3Ared+pow%3D3&unique=cards",
            "data": ['Card', 'CardTwo']
        };
        let stubs : any = {};
        let sandbox = sinon.createSandbox();
        beforeEach(() => {
            stubs.requestStub = sandbox.stub(GetCardNames.dependencies, 'request').resolves(JSON.stringify(json));
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('SearchByNameExact', (done) => {
            GetCardNames.GetCardNames().then((names) => {
                assert.isTrue(stubs.requestStub.calledOnce);
                assert.strictEqual(names[0], json.data[0]);
                assert.strictEqual(names[1], json.data[1]);
                assert.deepStrictEqual(names, json.data);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});