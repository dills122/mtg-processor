import { cleanString } from '../util';
import tesseract from 'tesseract.js';
import Logger from '../logger/log';

const dependencies = {
    Tesseract: tesseract
};

const logger = new Logger({
    isPretty: true
});

export async function ScanImage(imgBuffer: Buffer) {
    logger.info(`extract-text::ScanImage:: Scanning Card ${Buffer.isBuffer(imgBuffer) ? 'Image Buffer' : imgBuffer}`);
    const worker = dependencies.Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imgBuffer);
    await worker.terminate();
    if(!text || text.length <= 0) {
        throw new Error('No text returned from extraction');
    }
    let cleanText = cleanString(text);
    logger.info(`Extracted text: ${text}`);
    logger.info(`Extracted cleaned text: ${cleanText}`);
    return {
        dirtyText: text,
        cleanText,
    }
};

export default {
    ScanImage,
    dependencies
};