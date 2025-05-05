const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const User = require('../models/User');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to get user profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.userProfile = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resume analyzer endpoint
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    
    // Clean up the file
    fs.unlinkSync(req.file.path);

    const prompt = `
You're a resume reviewer AI for LinkedIn-like platforms.

Here's a user's resume content:

${pdfData.text}

Analyze this resume and provide a JSON response with:
1. score (number between 0-100)
2. strengths (array of strings)
3. weaknesses (array of strings)
4. jobRoles (array of strings)
5. message (string with 3 lines of encouragement and advice)

Be professional, constructive, and specific in your feedback.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer and career advisor. Provide detailed, constructive feedback in a professional tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const analysis = JSON.parse(completion.choices[0].message.content);
    
    res.json(analysis);
  } catch (err) {
    console.error('Resume Analysis Error:', err);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

// Career path suggestion endpoint
router.post('/career-path', getUserProfile, async (req, res) => {
  try {
    const { question } = req.body;
    const { name, skills, education, interests } = req.userProfile;

    const prompt = `
User Profile:
Name: ${name}
Skills: ${skills.join(', ')}
Education: ${education.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join(', ')}
Interests: ${interests.join(', ')}

User Question:
"${question}"

Now act as an expert career mentor. Suggest top job roles, skill improvement areas, and give a motivational career growth path tailored to the user's profile. Be conversational and specific.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert career mentor with deep knowledge of tech industry trends, job markets, and professional development. Provide personalized, actionable advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({
      response: completion.choices[0].message.content
    });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    res.status(500).json({ message: 'Error generating career advice' });
  }
});

// Smart Connect suggestions endpoint
router.post('/suggest-connections', getUserProfile, async (req, res) => {
  try {
    const currentUser = req.userProfile;
    
    // Get all users except current user and their existing connections
    const otherUsers = await User.find({
      _id: { 
        $nin: [currentUser._id, ...currentUser.connections] 
      }
    }).select('name skills interests education');

    if (otherUsers.length === 0) {
      return res.json({ suggestions: [] });
    }

    const prompt = `
You are an AI network matchmaker.

Target User:
Name: ${currentUser.name}
Skills: ${currentUser.skills.join(', ')}
Interests: ${currentUser.interests.join(', ')}
Education: ${currentUser.education.map(edu => `${edu.degree} in ${edu.field}`).join(', ')}

Here is the list of other users:
${otherUsers.map(u => `
Name: ${u.name}
Skills: ${u.skills.join(', ')}
Interests: ${u.interests.join(', ')}
Education: ${u.education.map(edu => `${edu.degree} in ${edu.field}`).join(', ')}
`).join('\n')}

Return top 5 connection suggestions. For each, provide:
- User Name
- Reason for match
- One-line AI-generated message explaining mutual value.
Be friendly and helpful.
Format the response as a JSON array of objects with these fields:
{
  "name": "user name",
  "reason": "reason for match",
  "message": "AI-generated message"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert network matchmaker who understands professional relationships and career development. Provide meaningful connection suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response and combine with user data
    const suggestions = JSON.parse(completion.choices[0].message.content);
    const enrichedSuggestions = suggestions.map(suggestion => {
      const user = otherUsers.find(u => u.name === suggestion.name);
      return {
        ...suggestion,
        userId: user._id,
        skills: user.skills,
        interests: user.interests,
        education: user.education
      };
    });

    res.json({ suggestions: enrichedSuggestions });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    res.status(500).json({ message: 'Error generating connection suggestions' });
  }
});

// Job matcher endpoint
router.post('/job-matcher', getUserProfile, async (req, res) => {
  try {
    const { resumeText, recentSearches } = req.body;
    const { bio, skills, interests } = req.userProfile;

    // Mock job database - in a real app, this would come from a database
    const jobDB = [
      {
        title: "Senior Full Stack Developer",
        company: "TechCorp",
        description: "Looking for an experienced developer with React, Node.js, and MongoDB expertise.",
        requirements: ["5+ years experience", "React", "Node.js", "MongoDB", "AWS"],
        location: "Remote"
      },
      {
        title: "AI/ML Engineer",
        company: "AI Solutions Inc",
        description: "Join our team to build cutting-edge machine learning models.",
        requirements: ["Python", "TensorFlow", "Deep Learning", "Data Science"],
        location: "San Francisco"
      },
      {
        title: "DevOps Engineer",
        company: "CloudTech",
        description: "Help us scale our infrastructure and implement CI/CD pipelines.",
        requirements: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        location: "New York"
      },
      {
        title: "Frontend Developer",
        company: "WebDesign Co",
        description: "Create beautiful and responsive user interfaces.",
        requirements: ["React", "TypeScript", "CSS", "UI/UX"],
        location: "Remote"
      },
      {
        title: "Backend Developer",
        company: "API Masters",
        description: "Build robust and scalable backend services.",
        requirements: ["Node.js", "Express", "SQL", "REST APIs"],
        location: "Chicago"
      }
    ];

    const prompt = `
You're an AI Job Matcher for a LinkedIn-like platform.

Here's the user's profile:
- Bio: ${bio}
- Skills: ${skills.join(', ')}
- Interests: ${interests.join(', ')}
- Resume Snippet: ${resumeText || 'Not provided'}
- Recent Searches: ${recentSearches ? recentSearches.join(', ') : 'None'}

From the following job database, recommend 5 best-fit jobs.

Job Listings:
${JSON.stringify(jobDB, null, 2)}

For each match, provide a JSON response with:
1. jobTitle
2. company
3. matchScore (number between 0-100)
4. reason (string explaining why this is a good match)
5. requirements (array of requirements that match the user's skills)

Be specific about why each job is a good match based on the user's profile and skills.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert job matcher who understands technical skills, career progression, and job market trends. Provide accurate and specific job matches."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const matches = JSON.parse(completion.choices[0].message.content);
    
    // Combine AI matches with job details
    const enrichedMatches = matches.map(match => {
      const job = jobDB.find(j => j.title === match.jobTitle && j.company === match.company);
      return {
        ...match,
        ...job
      };
    });

    res.json({ matches: enrichedMatches });
  } catch (err) {
    console.error('Job Matching Error:', err);
    res.status(500).json({ message: 'Error matching jobs' });
  }
});

// Voice profile builder endpoint
router.post('/voice-profile-builder', getUserProfile, async (req, res) => {
  try {
    const { transcribedText } = req.body;

    const prompt = `
You are an AI Profile Builder for a LinkedIn-like platform.

The user spoke the following:
"${transcribedText}"

Extract the following from their speech and convert into a professional LinkedIn-style profile format:
- Name (string)
- Bio (string, 2-3 sentences)
- Skills (array of strings)
- Work Experience (array of objects with role, company, duration)
- Education (array of objects with degree, university)

Format the response as a JSON object with these exact fields:
{
  "name": "string",
  "bio": "string",
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "university": "string"
    }
  ]
}

Be professional and formal in the bio and descriptions. If any information is missing, make reasonable assumptions based on the context.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert profile builder who understands professional networking and career development. Create polished, professional profiles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const profileData = JSON.parse(completion.choices[0].message.content);
    
    res.json(profileData);
  } catch (err) {
    console.error('Profile Building Error:', err);
    res.status(500).json({ message: 'Error building profile' });
  }
});

// Certification recommender endpoint
router.post('/certification-recommender', getUserProfile, async (req, res) => {
  try {
    const { bio, skills, experience, education } = req.userProfile;

    const prompt = `
You are a career AI assistant specializing in professional development and skill building.

A user has the following profile:
- Bio: ${bio}
- Skills: ${skills.join(', ')}
- Experience: ${experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})`).join(', ')}
- Education: ${education.map(edu => `${edu.degree} from ${edu.university}`).join(', ')}

Based on their current skills and work history, identify key areas for growth and recommend 3 to 5 relevant, short-term certifications or micro-courses that would be most impactful for their career development.

For each recommendation, provide:
1. A specific, high-demand skill or knowledge gap it addresses
2. Why this certification would be valuable for their career path
3. The estimated time commitment
4. The platform where it's available

Output format:
[
  {
    "title": "string",
    "platform": "string (Coursera, edX, Udemy, or LinkedIn Learning)",
    "description": "string (include skill gap addressed and value proposition)",
    "duration": "string (e.g., '4 weeks', '10 hours')",
    "link": "string (platform-specific URL)",
    "skillGap": "string (specific skill or knowledge area this addresses)",
    "valueProposition": "string (why this is valuable for their career)"
  }
]

Focus on:
- High-impact, practical skills
- Industry-relevant certifications
- Courses with good completion rates
- Skills that complement their existing experience
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor who understands professional development, skill building, and online education platforms. Provide specific, actionable certification recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const recommendations = JSON.parse(completion.choices[0].message.content);
    
    res.json({ recommendations });
  } catch (err) {
    console.error('Certification Recommendation Error:', err);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

// Job role simulator endpoint
router.post('/job-role-simulator', getUserProfile, async (req, res) => {
  try {
    const { jobTitle } = req.body;

    const prompt = `
You are a career simulator AI for a LinkedIn-like platform.

The user is exploring the role of a "${jobTitle}".

Provide a comprehensive simulation of this role, including:

1. Role Overview (2-3 sentences)
2. Daily Responsibilities (5 key tasks)
3. Realistic Scenarios (2 detailed scenarios with step-by-step approaches)
4. Essential Tools (3-5 tools with brief descriptions)
5. Key Skills (3-5 skills to master)

Format the response as a JSON object with these exact fields:
{
  "overview": "string",
  "dailyTasks": ["string"],
  "scenarios": [
    {
      "title": "string",
      "description": "string",
      "steps": ["string"]
    }
  ],
  "tools": [
    {
      "name": "string",
      "description": "string",
      "category": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "importance": "string",
      "learningResources": ["string"]
    }
  ]
}

Be specific, practical, and industry-relevant. Focus on real-world applications and current best practices.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor and industry professional who understands various job roles in depth. Provide accurate, practical, and engaging role simulations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const simulation = JSON.parse(completion.choices[0].message.content);
    
    res.json(simulation);
  } catch (err) {
    console.error('Job Role Simulation Error:', err);
    res.status(500).json({ message: 'Error generating job role simulation' });
  }
});

// Voice command endpoint
router.post('/voice-command', getUserProfile, async (req, res) => {
  try {
    const { command } = req.body;

    const prompt = `
You are a voice assistant for a LinkedIn-like platform.

The user said: "${command}"

Analyze this command and determine:
1. The intent (navigation, profile update, job search, analytics, etc.)
2. The specific action needed
3. Any relevant parameters or data

Return a JSON response with these exact fields:
{
  "intent": "string (navigation, profile_update, job_search, analytics, etc.)",
  "action": "string (specific action to take)",
  "parameters": {
    "target": "string (e.g., 'profile_bio', 'job_role')",
    "value": "string (if applicable)",
    "filters": "object (if applicable)"
  },
  "summary": "string (brief description of what to do)"
}

Be specific and practical in your interpretation. For profile updates, extract the exact text to update. For navigation, specify the exact route. For job searches, identify the role and any filters.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert voice assistant that understands professional networking platforms and user commands. Provide accurate, actionable interpretations of voice commands."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const interpretation = JSON.parse(completion.choices[0].message.content);
    
    res.json(interpretation);
  } catch (err) {
    console.error('Voice Command Error:', err);
    res.status(500).json({ message: 'Error interpreting voice command' });
  }
});

// Career mentor endpoint
router.post('/career-mentor', getUserProfile, async (req, res) => {
  try {
    const { question } = req.body;
    const { name, skills, education, interests, experience } = req.userProfile;

    const prompt = `
You are an experienced career mentor and guide for a LinkedIn-like platform.

User Profile:
- Name: ${name}
- Skills: ${skills.join(', ')}
- Education: ${education.map(edu => `${edu.degree} from ${edu.university}`).join(', ')}
- Experience: ${experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})`).join(', ')}
- Interests: ${interests.join(', ')}

The user asks:
"${question}"

Provide a helpful, personalized response that:
1. Acknowledges their background and experience
2. Offers specific, actionable advice
3. Suggests relevant tools, certifications, or learning resources
4. Maintains a professional yet friendly tone
5. Keeps the response concise (3-5 sentences)

Format the response as a JSON object with these exact fields:
{
  "response": "string (main response text)",
  "suggestions": [
    {
      "type": "string (tool, certification, or resource)",
      "name": "string",
      "description": "string",
      "link": "string (if applicable)"
    }
  ],
  "followUpQuestions": [
    "string (suggested follow-up questions)"
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert career mentor with deep knowledge of professional development, job markets, and career growth strategies. Provide personalized, actionable advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the AI response
    const mentorResponse = JSON.parse(completion.choices[0].message.content);
    
    res.json(mentorResponse);
  } catch (err) {
    console.error('Career Mentor Error:', err);
    res.status(500).json({ message: 'Error generating mentor response' });
  }
});

module.exports = router; 