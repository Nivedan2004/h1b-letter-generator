const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');


const TEMPLATE_PATH = path.resolve(process.cwd(), 'src/assets/example-h1b-letter.pdf');

async function readExampleTemplate() {
    try {
        
        if (!fs.existsSync(TEMPLATE_PATH)) {
            console.error(`Template not found at path: ${TEMPLATE_PATH}`);
            throw new Error(`Example H-1B letter template not found at ${TEMPLATE_PATH}`);
        }

        // Read the PDF file
        const dataBuffer = fs.readFileSync(TEMPLATE_PATH);
        
        // Parse PDF to text
        const pdfData = await pdfParse(dataBuffer);
        
        // Extract and clean the text
        const templateText = pdfData.text
            .replace(/\r\n/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();

        if (!templateText) {
            throw new Error('Template file is empty or could not be parsed');
        }

        console.log('Successfully read template file');
        return templateText;
    } catch (error) {
        console.error('Error reading template:', error);
        if (error.code === 'ENOENT') {
            throw new Error(`Template file not found. Please ensure the file exists at: ${TEMPLATE_PATH}`);
        }
        throw new Error(`Failed to read example H-1B letter template: ${error.message}`);
    }
}

module.exports = {
    readExampleTemplate,
    TEMPLATE_PATH
};