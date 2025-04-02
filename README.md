# Professional CV Extractor API

A powerful AI-powered API service for analyzing and extracting information from CV/Resume PDF documents. This Node.js application provides comprehensive analysis of CVs using OpenAI's advanced language models.

## Features

- **PDF Processing**: Extract text content from uploaded PDF documents
- **AI-Powered Analysis**:
  - Skill extraction and categorization
  - Work experience analysis
  - Sentiment and tone analysis
  - Experience validation
  - Qualification matching
- **Comprehensive Assessment**:
  - Basic information extraction
  - Career progression analysis
  - Professional profile assessment
  - Red flag detection
  - Overall candidate evaluation

## Security Features

- Secure API key management
- Environment variable validation
- File upload restrictions
- CORS configuration
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-extractor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     PORT=3000
     CORS_ORIGIN=http://localhost:3000
     ```

## Security Best Practices

1. **API Key Security**:
   - Never commit your `.env` file to version control
   - Keep your OpenAI API key secret
   - Use different API keys for development and production
   - Regularly rotate your API keys

2. **Environment Variables**:
   - Always use environment variables for sensitive data
   - Validate required environment variables on startup
   - Use different configurations for different environments

3. **File Upload Security**:
   - File size limit: 5MB
   - Only PDF files are accepted
   - Files are processed in memory, not stored on disk

## Usage

### Starting the Server

```bash
node index.js
```

The server will start on the specified port (default: 3000).

### API Endpoints

#### 1. Upload and Analyze CV
```
POST /upload
```

**Request Format:**
- Content-Type: multipart/form-data
- File: PDF CV (max 5MB)
- Optional parameters:
  - elements: JSON array of elements to extract (e.g., ["name", "email", "phone"])
  - qualifications: JSON array of qualifications to evaluate
  - jobRequirements: String of job requirements for matching

**Response Format:**
```json
{
  "success": true,
  "data": {
    "basicInfo": {
      "name": "...",
      "email": "...",
      "phone": "..."
    },
    "skillsAnalysis": {
      "technical": [...],
      "soft": [...]
    },
    "experienceAnalysis": {
      "totalYears": "...",
      "careerProgression": "...",
      "keyAchievements": [...],
      "industryExpertise": [...]
    },
    "sentimentAnalysis": {
      "overallTone": "...",
      "confidenceLevel": ...,
      "keyPositiveAspects": [...],
      "areasForImprovement": [...]
    },
    "experienceValidation": {
      "validationResults": {...},
      "confidenceScore": ...
    },
    "qualificationMatch": {...},
    "overallAssessment": {
      "confidenceScore": ...,
      "strengths": [...],
      "areasForImprovement": [...],
      "recommendation": "..."
    }
  },
  "metadata": {
    "processingTime": "...",
    "version": "1.0.0"
  }
}
```

## Error Handling

The API provides detailed error responses in case of failures:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- OpenAI for providing the AI capabilities
- pdf-parse for PDF text extraction
- Express.js for the web framework
- All contributors and users of this project
