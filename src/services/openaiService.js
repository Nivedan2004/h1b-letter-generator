const { OpenAI } = require('openai');
const PDFDocument = require('pdfkit');
const { readExampleTemplate } = require('../utils/pdfHandler');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generatePDF = async (letterContent) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Professional PDF formatting
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .text('EMPLOYER LETTERHEAD', { align: 'center' })
         .moveDown(2);

      doc.font('Helvetica')
         .fontSize(12);

      // Format content with proper spacing and alignment
      const sections = letterContent.split('\n\n');
      sections.forEach((section, index) => {
        doc.text(section.trim(), {
          align: section.includes('Dear') ? 'left' : 
                section.includes('Sincerely') ? 'left' : 'justify',
          continued: false
        });
        
        if (index < sections.length - 1) {
          doc.moveDown(2);
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateSupportLetter = async (beneficiary, employer, companyInfo = null) => {
  try {
    // Get the example template
    const exampleTemplate = await readExampleTemplate();

    // Construct enhanced prompt
    const prompt = `Generate an H-1B support letter following this exact example template:

${exampleTemplate}

Use these specific details to customize the letter while maintaining the same format and structure:
- Beneficiary: ${beneficiary.full_name} (${beneficiary.nationality})
- Role: ${employer.job_title} at ${employer.company_name}
- Salary: ${employer.pay_rate}
- Website: ${employer.company_website}

Job Duties:
${employer.job_roles.map(role => `- ${role}`).join('\n')}

${companyInfo ? `Additional Company Information:
${Object.entries(companyInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}` : ''}

Requirements:
1. Follow the exact same format and structure as the example template
2. Maintain the same professional tone and language style
3. Include all sections present in the example
4. Customize the content with the provided details
5. Keep any legal language or important disclaimers
6. Include proper letterhead and signature block as in the example
7. Use the same paragraph structure and section ordering as the example
8. Maintain any specific legal citations or references from the example
9. Keep the same level of detail and specificity for job responsibilities
10. Preserve any USCIS-specific formatting or references`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an experienced immigration lawyer specializing in H-1B visas. Generate a support letter that exactly follows the provided example template's format and structure while incorporating the specific details provided. Maintain all legal language, citations, and professional tone from the example."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000, // Increased to accommodate longer letters
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const letterContent = response.choices[0].message.content;

    // Additional formatting and validation
    const formattedContent = letterContent
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
      .trim();

    // Generate PDF
    const pdfBuffer = await generatePDF(formattedContent);

    return {
      text: formattedContent,
      pdf: pdfBuffer
    };

  } catch (error) {
    console.error('Letter Generation Error:', error);
    
    if (error.message.includes('template not found')) {
      throw new Error('Example H-1B letter template not found. Please ensure the template file is properly placed in the assets directory.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit reached. Please try again in a few moments.');
    } else if (error.response?.status === 401) {
      throw new Error('API key error. Please check your OpenAI API key.');
    } else {
      throw new Error(`Letter generation failed: ${error.message || 'Unknown error'}`);
    }
  }
};

module.exports = {
  generateSupportLetter
};