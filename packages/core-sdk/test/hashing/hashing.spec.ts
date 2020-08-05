import Hashing, { dependencies } from '../../src/image-hashing/hash-image';
import { assert, expect } from 'chai';
import sinon from 'sinon';

describe('Hashing::', () => {
    const url = 'https://img.scryfall.com/cards/normal/en/shm/53.jpg?1517813031';
    const fakeHash = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
    let stubs: any = {};
    let sandbox: sinon.SinonSandbox;
    describe('ImageHashing::', () => {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            stubs.imageHashStub = sandbox.stub(dependencies, 'imageHash').callsArgWith(3, null, fakeHash);
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('Should return a hash of the image', (done) => {
            Hashing.hashImage(url).then((hash) => {
                assert.isString(hash);
                assert.isTrue(stubs.imageHashStub.calledOnce, "Image Hash called");
                done();
            }).catch((err) => {
                return done(err);
            });
        });

        it('Should error out if image hash encounters an error', (done) => {
            stubs.imageHashStub.restore();
            stubs.imageHashStub = sinon.stub(dependencies, 'imageHash').callsArgWith(3, new Error('TEST'), null);
            Hashing.hashImage('').then((_hash) => {
                return done();
            }).catch((err) => {
                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.equal('TEST');
                return done();
            });
        });
        
        it('Should error out if no data is returned from imageHash', (done) => {
            stubs.imageHashStub.restore();
            stubs.imageHashStub = sinon.stub(dependencies, 'imageHash').callsArgWith(3, null, '');
            Hashing.hashImage('').then((_hash) => {
                return done();
            }).catch((err) => {
                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.equal('No data or empty data was returned');
                return done();
            });
        });
    });
    describe('HashComparison::', () => {
        const hashOne = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
        const hashTwo = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
        const hashThree = '2203063f063f36070e070a070f378e7f1f434fff0fff020103f11ffb0f810ff0';

        it('Should return a hash comparison result', (done) => {
            let hashComparisonResults = Hashing.compareHash(hashOne, hashTwo);
            assert.isObject(hashComparisonResults);
            assert.equal(hashComparisonResults.twoBitMatches, 1);
            assert.equal(hashComparisonResults.fourBitMatches, 1);
            assert.equal(hashComparisonResults.stringCompare, 1);
            done();
        });

        it('Should return a hash comparison result 2', (done) => {
            let hashComparisonResults = Hashing.compareHash(hashOne, hashThree);
            assert.isObject(hashComparisonResults);
            const { fourBitMatches, twoBitMatches, stringCompare } = hashComparisonResults;
            expect(fourBitMatches).to.be.a('number').and.greaterThan(.6);
            expect(twoBitMatches).to.be.a('number').and.greaterThan(.8);
            expect(stringCompare).to.be.a('number').and.greaterThan(.8);
            done();
        });

        it('Should throw if not same hash lengths', (done) => {
            let thrws: any = () => Hashing.compareHash(hashThree, '');
            assert.throws(thrws);
            done();
        });
    });
});