import sinon from 'sinon';
import NameMatch, { dependencies } from '../../src/fuzzy-matching/match-name';
import { expect, assert } from 'chai';

import mock from '../../mocks/bulkCardNames';

describe('FuzzyMatching::', () => {
    let sandbox: sinon.SinonSandbox;
    let bulkNamesStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        bulkNamesStub = sandbox.stub(dependencies, "GetNames").resolves(mock);
    });
    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });
    describe('NameMatching::', () => {
        it('Should return a high probability match', (done) => {
            let name = 'AdantoVanguard';
            let matcher = new NameMatch({
                cleanText: name
            });
            matcher.Match().then((matches) => {
                expect(matches).to.be.a('array').and.length(1);
                const match = matches[0];
                expect(match).to.be.a('object').and.to.haveOwnProperty('name');
                expect(match).to.be.a('object').and.to.haveOwnProperty('percentage');
                expect(match.percentage).to.be.a('number').and.to.be.greaterThan(.90);
                assert.equal(bulkNamesStub.callCount, 1);
                return done();
            }).catch((err) => {
                return done(err);
            });
        });

        it('Should return a medium high probability match', (done) => {
            let name = 'Lawlass Brk';
            let matcher = new NameMatch({
                cleanText: name
            });
            matcher.Match().then((matches) => {
                expect(matches).to.be.a('array').and.length(1);
                const match = matches[0];
                expect(match).to.be.a('object').and.to.haveOwnProperty('name');
                expect(match).to.be.a('object').and.to.haveOwnProperty('percentage');
                expect(match.percentage).to.be.a('number').and.to.be.greaterThan(.70);
                assert.equal(bulkNamesStub.callCount, 1);
                return done();
            }).catch((err) => {
                return done(err);
            });
        });

        it('Should return no match due to low probability', (done) => {
            let name = 'Coat Vangsduardsadfasd';
            let matcher = new NameMatch({
                cleanText: name
            });
            matcher.Match().then((matches) => {
                expect(matches).to.be.a('array').and.length(0);
                const match = matches[0];
                expect(match).to.be.a('undefined');
                assert.equal(bulkNamesStub.callCount, 1);
                return done();
            }).catch((err) => {
                return done(err);
            });
        });
    });
});