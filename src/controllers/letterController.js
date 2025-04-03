const { generateSupportLetter } = require('../services/openaiService');

const generateLetter = async (req, res) => {
  try {
    const { beneficiary, employer } = req.body;
    const result = await generateSupportLetter(beneficiary, employer);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
      status: 'success', 
      data: {
        letter: result.text,
        pdf: result.pdf.toString('base64')
      }
    });
  } catch (error) {
    console.error('Error generating letter:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate support letter',
      error: error.message 
    });
  }
};

// Make sure to export the function
module.exports = {
  generateLetter
};