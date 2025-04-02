require("dotenv").config(); 
const { Configuration, OpenAIApi } = require("openai"); // Direct import
const express = require("express");
const pdfParse = require("pdf-parse");
const multer = require("multer");
const cors = require("cors");
const config = require('./config');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Configure OpenAI API client
const configuration = new Configuration({
  apiKey: config.openai.apiKey,
});
const openai = new OpenAIApi(configuration);

// Set up multer for handling file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.fileUpload.maxSize,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (config.fileUpload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Root route to confirm server is running
app.get('/', (req, res) => {
  res.send("Welcome to the Professional CV Analysis API! Use the /upload endpoint to upload a CV.");
});

// Function to analyze CV content using OpenAI
async function analyzeCVWithAI(text) {
  try {
    const prompt = `Analyze the following CV content and provide a structured analysis:
    ${text}
    
    Please provide:
    1. Key skills and expertise
    2. Work experience summary
    3. Education background
    4. Notable achievements
    5. Overall professional profile assessment
    6. Potential job role matches
    7. Areas for improvement`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}

// Function to match qualifications with job requirements
async function matchQualifications(text, requirements) {
  try {
    const prompt = `Compare the following CV content with the job requirements and provide a matching score and detailed analysis:
    
    CV Content:
    ${text}
    
    Job Requirements:
    ${requirements}
    
    Please provide:
    1. Overall match percentage
    2. Matching skills
    3. Missing qualifications
    4. Recommendations`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Qualification Matching Error:", error);
    throw error;
  }
}

// Function to extract skills using AI
async function extractSkills(text) {
  try {
    const prompt = `Extract and categorize technical and soft skills from the following CV content. 
    Format the response as a JSON object with two arrays: "technical" and "soft":
    ${text}`;

    const response = await openai.createCompletion({
      model: config.openai.model,
      prompt: prompt,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    return JSON.parse(response.data.choices[0].text.trim());
  } catch (error) {
    console.error("Skill Extraction Error:", error);
    throw error;
  }
}

// Function to analyze work experience
async function analyzeExperience(text) {
  try {
    const prompt = `Analyze the work experience from the following CV content and provide:
    1. Total years of experience
    2. Career progression
    3. Key achievements
    4. Industry expertise
    Format as a structured JSON object.`;

    const response = await openai.createCompletion({
      model: config.openai.model,
      prompt: prompt,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    return JSON.parse(response.data.choices[0].text.trim());
  } catch (error) {
    console.error("Experience Analysis Error:", error);
    throw error;
  }
}

// Function to perform sentiment analysis
async function analyzeSentiment(text) {
  try {
    const prompt = `Analyze the tone and professionalism of the following CV content.
    Provide a JSON response with:
    1. Overall tone (professional, casual, etc.)
    2. Confidence level (1-10)
    3. Key positive aspects
    4. Areas for improvement`;

    const response = await openai.createCompletion({
      model: config.openai.model,
      prompt: prompt,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    return JSON.parse(response.data.choices[0].text.trim());
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    throw error;
  }
}

// Function to validate experience claims
async function validateExperience(text) {
  try {
    const prompt = `Analyze the following CV content for potential inconsistencies or red flags in:
    1. Employment dates
    2. Job titles and responsibilities
    3. Educational claims
    4. Skill claims
    Provide a JSON response with validation results and confidence scores.`;

    const response = await openai.createCompletion({
      model: config.openai.model,
      prompt: prompt,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    return JSON.parse(response.data.choices[0].text.trim());
  } catch (error) {
    console.error("Experience Validation Error:", error);
    throw error;
  }
}

app.post('/upload', upload.single('cv'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ 
              success: false,
              error: 'Please upload a PDF file.' 
          });
      }

      // Extract text from PDF
      const data = await pdfParse(req.file.buffer);
      const extractedText = data.text;

      // Parse elements and qualifications from the request
      const elements = JSON.parse(req.body.elements || '[]');
      const qualifications = JSON.parse(req.body.qualifications || '[]');
      const jobRequirements = req.body.jobRequirements || '';

      // Extract basic information
      const extractedInfo = {};
      if (elements.includes("name")) {
          const nameMatch = extractedText.match(/Name:\s*(.*)/i);
          extractedInfo.name = nameMatch ? nameMatch[1].trim() : "Not found";
      }
      if (elements.includes("email")) {
          const emailMatch = extractedText.match(/Email:\s*(.*)/i);
          extractedInfo.email = emailMatch ? emailMatch[1].trim() : "Not found";
      }
      if (elements.includes("phone")) {
          const phoneMatch = extractedText.match(/Phone:\s*(.*)/i);
          extractedInfo.phone = phoneMatch ? phoneMatch[1].trim() : "Not found";
      }

      // Perform all analyses in parallel
      const [skills, experience, sentiment, validation] = await Promise.all([
          extractSkills(extractedText),
          analyzeExperience(extractedText),
          analyzeSentiment(extractedText),
          validateExperience(extractedText)
      ]);

      // Qualification Matching (if job requirements are provided)
      let qualificationMatch = null;
      if (jobRequirements) {
          qualificationMatch = await matchQualifications(extractedText, jobRequirements);
      }

      // Generate overall assessment
      const overallAssessment = {
          confidenceScore: (sentiment.confidenceLevel + validation.confidenceScore) / 2,
          strengths: [...skills.technical, ...sentiment.keyPositiveAspects],
          areasForImprovement: [...sentiment.areasForImprovement, ...validation.redFlags],
          recommendation: sentiment.overallTone === 'professional' ? 'Strong Candidate' : 'Needs Review'
      };

      // Send the comprehensive analysis
      res.json({
          success: true,
          data: {
              basicInfo: extractedInfo,
              skillsAnalysis: skills,
              experienceAnalysis: experience,
              sentimentAnalysis: sentiment,
              experienceValidation: validation,
              qualificationMatch,
              overallAssessment
          },
          metadata: {
              processingTime: new Date().toISOString(),
              version: "1.0.0"
          }
      });

  } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ 
          success: false,
          error: "An error occurred during CV processing", 
          details: error.message 
      });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
      success: false,
      error: 'Something broke!',
      details: err.message
  });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});