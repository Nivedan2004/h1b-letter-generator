const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCompanyWebsite(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract relevant information
    const companyInfo = {
      description: $('meta[name="description"]').attr('content') || '',
      about: $('p:contains("About")').text() || $('p:contains("about")').text() || '',
      mission: $('p:contains("Mission")').text() || $('p:contains("mission")').text() || ''
    };

    // Clean and format the extracted data
    const cleanedInfo = Object.entries(companyInfo)
      .filter(([_, value]) => value.length > 0)
      .reduce((acc, [key, value]) => {
        acc[key] = value.trim().replace(/\s+/g, ' ');
        return acc;
      }, {});

    return cleanedInfo;
  } catch (error) {
    console.error('Website scraping error:', error);
    return null;
  }
}

module.exports = { scrapeCompanyWebsite };