const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');
const localDB = require('../../src/db-local/grab-names');

describe('FuzzyMatching::', () => {
    let sandbox = {};
    let stubs = {};
    let MatchName = {};

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        stubs.BulkNamesStub = sandbox.stub(localDB, "GetBulkNames").callsArgWith(0, null, [{
            name: "Legion's Landing // Adanto, the First Fort"
        },
        {
            name: "Adanto Vanguard"
        },
        {
            name: "Shadow of Doubt"
        },
        {
            name: "Chain Lightning"
        },
        {
            "name": "Gangrenous Zombies"
        },
        {
            "name": "Sarkhan Vol"
        },
        {
            "name": "Darkness"
        },
        {
            "name": "Commandeer"
        },
        {
            "name": "Carrion Beetles"
        },
        {
            "name": "Drag Down"
        },
        {
            "name": "Swirling Sandstorm"
        },
        {
            "name": "Diving Griffin"
        },
        {
            "name": "Copperhoof Vorrac"
        },
        {
            "name": "Lawless Broker"
        },
        {
            "name": "Dark Supplicant"
        },
        {
            "name": "Weldfast Monitor"
        },
        {
            "name": "Inspiring Roar"
        },
        {
            "name": "Gavony Unhallowed"
        },
        {
            "name": "Creeping Renaissance"
        },
        {
            "name": "Coat of Arms"
        },
        {
            "name": "Mobilized District"
        },
        {
            "name": "Emberhorn Minotaur"
        },
        {
            "name": "Well of Life"
        },
        {
            "name": "Juvenile Gloomwidow"
        },
        {
            "name": "Canopy Vista"
        },
        {
            "name": "Champion of Wits"
        },
        {
            "name": "Zephyr Falcon"
        },
        {
            "name": "Sulfurous Blast"
        },
        {
            "name": "Archfiend of Despair"
        }
        ]);
        const { default: Matcher } = proxyquire('../../src/fuzzy-matching/match-name', {
            GetBulkNames: stubs.BulkNamesStub
        });
        MatchName = Matcher;
    });
    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });
    describe('NameMatching::', () => {
        it('Should return a high probability match', (done) => {
            let name = 'AdantoVanguard';
            let matcher = new MatchName({
                cleanText: name
            });
            matcher.Match().then((matches) => {
                console.log(matches);
                let [first] = matches;
                assert.equal(stubs.BulkNamesStub.callCount, 1);
                expect(matches).to.be.an('array');
                assert.equal(first.name, 'Adanto Vanguard');
                chai.assert.isObject(first);
                chai.assert.isAtMost(Object.keys(first).length, 2);
                chai.assert.isAtLeast(first.percentage, .85);
                chai.assert.isAtLeast(matches.length, 1);
                return done(err);
            }).catch((err) => {
                return done(err);
            });
        });

        it('Should return no match due to low probability', (done) => {
            let name = 'Coat Vangsduardsadfasd';
            let matcher = new MatchName({
                cleanText: name
            });
            matcher.Match().then((err, matches) => {
                console.log(matches);
                assert.equal(stubs.BulkNamesStub.callCount, 1);
                chai.assert.isArray(matches);
                assert.equal(matches.length, 0);
                return done(err);
            }).catch((err) => {
                return done(err);
            });
        });
    });
});