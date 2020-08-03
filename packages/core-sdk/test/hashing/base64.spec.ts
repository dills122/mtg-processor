import Base64 from '../../src/image-hashing/base64-img';
import { assert, expect } from 'chai';
import sinon from 'sinon';

describe('Base64::', () => {
    let stubs: any = {};
    let sandbox: sinon.SinonSandbox;

    describe('stringfyImageExtractions::', () => {
        const base64Str = 'QVNGRERTRlNBRkFTREZTREZTREZTRg==';
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            stubs.base64Stub = sandbox.stub(Base64.dependencies, 'base64Img').resolves(base64Str);
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('Should return a hash of the image', (done) => {
            Base64.stringfyImageExtractions({
                flavorImage: '',
                artImage: '',
                typeImage: '',
                nameImage: ''
            }).then((base64Imgs) => {
                assert.isObject(base64Imgs);
                assert.deepEqual(base64Imgs.nameImage, base64Str);
                assert.deepEqual(base64Imgs.typeImage, base64Str);
                assert.deepEqual(base64Imgs.flavorImage, base64Str);
                assert.deepEqual(base64Imgs.artImage, base64Str);
                assert.equal(stubs.base64Stub.callCount, 4);
                done();
            }).catch((error) => {
                done(error);
            });
        });

        it('Should handle an error in base64', (done) => {
            stubs.base64Stub.restore();
            stubs.base64Stub = sandbox.stub(Base64.dependencies, 'base64Img').rejects(new Error('TEST'));
            Base64.stringfyImageExtractions({
                flavorImage: '',
                artImage: '',
                typeImage: '',
                nameImage: ''
            }).then((_base64Imgs) => {
                return done();
            }).catch((error) => {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('TEST');
            });
        });
    });

    describe('stringfyBuffer', () => {
        it('Should return base64 string of buffer', (done) => {
            const testStr = 'Test Buffer';
            const base64Str = Base64.stringfyBuffer(Buffer.from(testStr, 'ascii'));
            expect(base64Str).to.be.a('string').and.not.length(0);
            const base64Buffer = Buffer.from(base64Str, 'base64');
            expect(base64Buffer.toString('ascii')).to.equal(testStr);
            return done();
        });

        it('Should return base64 string of buffer 2', (done) => {
            const testStr = 'Test Buffer 1';
            const base64Str = Base64.stringfyBuffer(Buffer.from(testStr, 'ascii'));
            expect(base64Str).to.be.a('string').and.not.length(0);
            const base64Buffer = Buffer.from(base64Str, 'base64');
            expect(base64Buffer.toString('ascii')).to.equal(testStr);
            return done();
        });

        it('Should return an empty string if an empty buffer is provided', (done) => {
            const testStr = '';
            const base64Str = Base64.stringfyBuffer(Buffer.from(testStr, 'ascii'));
            expect(base64Str).to.be.a('string').and.length(0);
            return done();
        });
    });
});