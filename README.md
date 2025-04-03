# H-1B Support Letter Generator

An API service that generates H-1B support letters using AI.

## Features

- Generates customized H-1B support letters
- Uses OpenAI GPT for content generation
- PDF generation with professional formatting
- Input validation
- Company website scraping capability

## Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/h1b-letter-generator.git
cd h1b-letter-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
OPENAI_API_KEY=your_api_key_here
```

4. Place example H-1B letter template in src/assets/example-h1b-letter.pdf

5. Start the server:
```bash
node src/app.js
```

## API Usage

POST /api/generate-letter

Request body:
```json
{
  "beneficiary": {
    "full_name": "Name",
    "nationality": "Country"
  },
  "employer": {
    "company_name": "Company Name",
    "job_title": "Job Title",
    "pay_rate": "Salary",
    "job_roles": ["Role 1", "Role 2"],
    "company_website": "https://company.com"
  }
}
```

## License

MIT

