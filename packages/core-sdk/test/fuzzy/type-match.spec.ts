import MatchType from '../../src/fuzzy-matching/match-type';
import sinon from 'sinon';
import { expect, assert } from 'chai';
// import mocha from 'mocha';


describe('FuzzyMatching::', () => {
    describe('TypeMatching::', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sinon.restore();
            sandbox.restore();
        });

        it('Should match on creature', (done) => {
            const inputStr = 'creatre';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.haveOwnProperty('name');
            expect(match).to.be.an('object').and.haveOwnProperty('matchPercentage');
            assert(match.name);
            expect(match.name).to.be.a('string').and.equal('Creature');
            expect(match.matchPercentage).to.be.a('number').and.greaterThan(.75);

            return done();
        });
        it('Should match on creature', (done) => {
            const inputStr = 'creatr';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.haveOwnProperty('name');
            expect(match).to.be.an('object').and.haveOwnProperty('matchPercentage');
            assert(match.name);
            expect(match.name).to.be.a('string').and.equal('Creature');
            expect(match.matchPercentage).to.be.a('number').and.greaterThan(.60);

            return done();
        });

        it('Should match near 100% on a creature type', (done) => {
            const inputStr = 'Troll';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.haveOwnProperty('name');
            expect(match).to.be.an('object').and.haveOwnProperty('matchPercentage');
            assert(match.name);
            expect(match.name).to.be.a('string').and.equal('Troll');
            expect(match.matchPercentage).to.be.a('number').and.greaterThan(.90);

            return done();
        });

        it('Should match high with compound name', (done) => {
            const inputStr = 'Troll adfad';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.haveOwnProperty('name');
            expect(match).to.be.an('object').and.haveOwnProperty('matchPercentage');
            assert(match.name);
            expect(match.name).to.be.a('string').and.equal('Troll');
            expect(match.matchPercentage).to.be.a('number').and.greaterThan(.90);

            return done();
        });

        it('Should match high with compound name, pick first high match', (done) => {
            const inputStr = 'Troll Creature';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.haveOwnProperty('name');
            expect(match).to.be.an('object').and.haveOwnProperty('matchPercentage');
            assert(match.name);
            expect(match.name).to.be.a('string').and.equal('Troll');
            expect(match.matchPercentage).to.be.a('number').and.greaterThan(.90);

            return done();
        });

        it('Should return no matches with bad data', (done) => {
            const inputStr = 'adfad';
            const matcher = new MatchType();
            const match: any = matcher.match(inputStr);
            expect(match).to.be.an('object').and.empty;
            assert.isUndefined(match.name);
            return done();
        });
    });
});