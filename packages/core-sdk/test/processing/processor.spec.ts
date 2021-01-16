import Processor from '../../src/processor/processor';
import ImageProcessor from '../../src/image-processing/image-processor';
import TextExtraction from '../../src/image-analysis/extract-text';
import { dependencies } from '../../src/fuzzy-matching/match-name';
import { expect } from 'chai';
import sinon from 'sinon';

import mock from '../../mocks/bulkCardNames';
import { MatchName } from '../../src/fuzzy-matching';

const EXTRACTED_TEXT_HIGH = "AdantoVanguard";
const EXTRACTED_TEXT_MED = "Lawlass Brk";
const EXTRACTED_TEXT_LOW = "Coat Vangsduardsadfasd";

describe('Processor::', () => {
    let stubs: any = {};
    let spies: any = {};
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        stubs.scanImageStub = sandbox.stub(TextExtraction, 'ScanImage').resolves({
            dirtyText: EXTRACTED_TEXT_HIGH,
            cleanText: EXTRACTED_TEXT_HIGH
        });
        stubs.imageProcessorExtractStub = sandbox.stub(ImageProcessor.prototype, 'cropImage').resolves();
        stubs.bulkNameStub = sandbox.stub(dependencies, "GetNames").resolves(mock);
        spies.executeNeedsAttentionSpy = sandbox.spy(Processor.prototype, 'executeNeedsAttention');
        spies.executeCollectionSpy = sandbox.spy(Processor.prototype, 'executeCollection');
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('happy path::', () => {
        it('Should be able to get a high confidence match', async () => {
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_HIGH,
                cleanText: EXTRACTED_TEXT_HIGH
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_HIGH)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(1);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(1);
            expect(stubs.bulkNameStub.callCount).to.equal(1);
            expect(spies.executeCollectionSpy.callCount).to.equal(1);
            expect(spies.executeNeedsAttentionSpy.callCount).to.equal(0);
            expect(processorInst.nameMatchResults).to.be.a('array').and.length(1);
        });

        it('Should be able to get a medium confidence match, happy path', async () => {
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_MED,
                cleanText: EXTRACTED_TEXT_MED
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_MED)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(1);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(1);
            expect(stubs.bulkNameStub.callCount).to.equal(1);
            expect(spies.executeCollectionSpy.callCount).to.equal(1);
            expect(spies.executeNeedsAttentionSpy.callCount).to.equal(0);
            expect(processorInst.nameMatchResults).to.be.a('array').and.length(1);
        });

        it('Should be able to get a medium confidence match and return multiple match records, happy path', async () => {
            stubs.filterBulkMatchesStub = sandbox.stub(MatchName.default.prototype, 'filterBulkMatches').returns([
                {
                    name: 'NAME',
                    percentage: 80
                },
                {
                    name: 'NAME',
                    percentage: 80
                }
            ]);
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_MED,
                cleanText: EXTRACTED_TEXT_MED
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_MED)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(1);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(1);
            expect(stubs.filterBulkMatchesStub.callCount).to.equal(1);
            expect(stubs.bulkNameStub.callCount).to.equal(1);
            expect(spies.executeNeedsAttentionSpy.callCount).to.equal(1);
            expect(spies.executeCollectionSpy.callCount).to.equal(0);
            expect(processorInst.nameMatchResults).to.be.a('array').and.length(2);
        });

        it('Should be able to get no matches due to low confidence matches, happy path', async () => {
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_LOW,
                cleanText: EXTRACTED_TEXT_LOW
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_LOW)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(1);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(1);
            expect(stubs.bulkNameStub.callCount).to.equal(1);
            expect(spies.executeCollectionSpy.callCount).to.equal(0);
            expect(spies.executeNeedsAttentionSpy.callCount).to.equal(0);
            expect(processorInst.nameMatchResults).to.be.an('array').and.length(0);
        });
    });

    describe('Image Processor Failure', () => {

        beforeEach(() => {
            stubs.extractStub = sandbox.stub(ImageProcessor.prototype, 'extract').throws('Unable to process');
        });

        it('Should fail due to an image processor error', async () => {
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_HIGH,
                cleanText: EXTRACTED_TEXT_HIGH
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_HIGH)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(0);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(0);
            expect(stubs.bulkNameStub.callCount).to.equal(0);
            expect(stubs.extractStub.callCount).to.equal(1);
            expect(processorInst.nameMatchResults).to.be.a('array').and.length(0);
        });
    });

    describe('Name Matching Failure', () => {

        beforeEach(() => {
            stubs.nameMatchingStub = sandbox.stub(MatchName.default.prototype, 'Match').throws('Unable to process');
        });

        it('Should fail due to an image processor error', async () => {
            stubs.scanImageStub.resolves({
                dirtyText: EXTRACTED_TEXT_HIGH,
                cleanText: EXTRACTED_TEXT_HIGH
            });
            const processorInst = new Processor({
                file: Buffer.from(EXTRACTED_TEXT_HIGH)
            });
            await processorInst.execute();
            expect(stubs.scanImageStub.callCount).to.equal(1);
            expect(stubs.imageProcessorExtractStub.callCount).to.equal(1);
            expect(stubs.bulkNameStub.callCount).to.equal(0);
            expect(stubs.nameMatchingStub.callCount).to.equal(1);
            expect(processorInst.nameMatchResults).to.be.a('array').and.length(0);
        });
    });
});