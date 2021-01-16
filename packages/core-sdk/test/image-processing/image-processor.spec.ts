import { assert } from 'chai';
import sinon from 'sinon';
import { ImageProcessor } from '../../src/image-processing';
import { resize } from '../../src/image-processing/';
import textExtraction from '../../src/image-analysis/extract-text'

const FAKE_PATH = "./to/fake.img";
const TYPE = "name";
const FAKE_EXTRACTION = {
    cleanText: 'MTG Card',
    dirtyText: '$ MTG Card'
};

describe("Integration::", () => {
    describe("ImageProcessor::", () => {
        let sandbox = sinon.createSandbox();
        let stubs: any = {};

        beforeEach(() => {
            stubs.resizeStub = sandbox.stub(resize, "getImageSnippet").resolves(Buffer.from(FAKE_PATH));
            stubs.textExtractionStub = sandbox.stub(textExtraction, "ScanImage").resolves(FAKE_EXTRACTION);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("Should execute happy path and return extraction results", async () => {
            let processor = new ImageProcessor({
                image: Buffer.from(FAKE_PATH),
                type: TYPE
            });
            await processor.extract();
            assert.isTrue(stubs.resizeStub.calledOnce);
            assert.isTrue(stubs.textExtractionStub.calledOnce);
            assert.deepEqual(processor.extractionResults, FAKE_EXTRACTION);
        });

        it("Should error out due to resize failure", async () => {
            stubs.resizeStub.throws(Error('ERR'));
            let processor = new ImageProcessor({
                image: Buffer.from(FAKE_PATH),
                type: TYPE
            });
            try {
                await processor.extract();
            }
            catch (err) {
                assert(err);
                assert.isTrue(stubs.resizeStub.calledOnce);
                assert.isFalse(stubs.textExtractionStub.calledOnce);
            }
        });

        it("Should error out due to scan failure", async () => {
            stubs.textExtractionStub.throws(Error('ERR'));
            let processor = new ImageProcessor({
                image: Buffer.from(FAKE_PATH),
                type: TYPE
            });
            try {
                await processor.extract();
            }
            catch (err) {
                assert(err);
                assert.isTrue(stubs.resizeStub.calledOnce);
                assert.isTrue(stubs.textExtractionStub.calledOnce);
            }
        });
    });
});