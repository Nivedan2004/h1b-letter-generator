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
        },
        size: 'letter'
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Remove the EMPLOYER LETTERHEAD from content if it exists
      let cleanedContent = letterContent.replace('EMPLOYER LETTERHEAD', '').trim();

      // EMPLOYER LETTERHEAD
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .text('EMPLOYER LETTERHEAD', { align: 'center' })
         .moveDown(2);

      // Split content into sections and remove any empty lines at the start
      const sections = cleanedContent.split(/\n(?=COMPANY PROFILE|THE JOB DUTIES|THE BENEFICIARY)/g)
                                   .map(section => section.trim());

      // Process each section
      sections.forEach((section, index) => {
        if (index === 0) {
          // First section contains header information
          const headerLines = section.split('\n');
          headerLines.forEach((line, i) => {
            if (line.trim()) {
              if (line.startsWith('Re:')) {
                doc.font('Times-Roman')
                   .fontSize(12)
                   .text('Re:', { continued: true })
                   .text('      ' + line.substring(3).trim(), { align: 'left' });
              } else {
                doc.font('Times-Roman')
                   .fontSize(12)
                   .text(line.trim(), { align: 'left' });
              }
              doc.moveDown(1);
            }
          });
        } else {
          // Handle other sections
          if (section.includes('COMPANY PROFILE')) {
            doc.font('Times-Roman')
               .fontSize(12)
               .text('COMPANY PROFILE', { align: 'center' })
               .moveDown(1)
               .text(section.replace('COMPANY PROFILE', '').trim(), {
                 align: 'justify',
                 lineGap: 2
               });
          } else if (section.includes('THE JOB DUTIES')) {
            doc.moveDown(1)
               .font('Times-Roman')
               .text(section, {
                 align: 'justify',
                 lineGap: 2
               });
          } else if (section.includes('THE BENEFICIARY')) {
            doc.moveDown(1)
               .font('Times-Roman')
               .text(section, {
                 align: 'justify',
                 lineGap: 2
               });
          } else {
            doc.font('Times-Roman')
               .text(section, {
                 align: 'justify',
                 lineGap: 2
               });
          }
          doc.moveDown(1);
        }
      });

      // Signature block
      doc.moveDown(2)
         .text('Sincerely,', { align: 'left' })
         .moveDown(3)
         .text('_____________________', { align: 'left' })
         .moveDown(1)
         .text('[Name and Title]', { align: 'left' })
         .text('[Company Name]', { align: 'left' });

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

    const prompt = `Generate a formal H-1B support letter following this exact format:

[date]

U.S. Citizenship and Immigration Services

Re:      [Company Name]/Petition for Nonimmigrant Worker on behalf of [Beneficiary Name]

Dear Sir/Madam:

[Introduction paragraph about the petition]

COMPANY PROFILE
[Detailed company background and description]

THE JOB DUTIES
[Detailed description of position and responsibilities]

THE BENEFICIARY
[Beneficiary's qualifications and suitability]

Sincerely,

[Name]
[Title]
[Company Name]

Use these specific details:
- Beneficiary: ${beneficiary.full_name} (${beneficiary.nationality})
- Role: ${employer.job_title} at ${employer.company_name}
- Salary: ${employer.pay_rate}
- Website: ${employer.company_website}

Job Duties:
${employer.job_roles.map(role => `- ${role}`).join('\n')}

${companyInfo ? `Additional Company Information:
${Object.entries(companyInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}` : ''}

Requirements:
1. Format exactly like a formal business letter
2. Use Times New Roman or similar font
3. Justify all paragraphs
4. Center the section headers
5. Maintain proper spacing between sections
6. Include all standard letter components (date, address, salutation, etc.)
7. Keep content professional and formal
8. Follow standard H-1B support letter conventions
9. Include specific job responsibilities and requirements
10. Maintain proper paragraph spacing and formatting`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an experienced immigration lawyer specializing in H-1B visas. Generate a support letter that exactly follows the provided format while incorporating the specific details provided. Maintain all legal language, citations, and professional tone. Ensure the letter follows standard business letter formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const letterContent = response.choices[0].message.content;

    // Additional formatting and validation
    const formattedContent = letterContent
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
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