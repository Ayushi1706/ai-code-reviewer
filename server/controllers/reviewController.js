const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const Review = require('../models/Review');

exports.reviewCode = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined');
    }

    const { code, language, focus, customStandards } = req.body;

    if (!code || !language || !focus) {
      return res.status(400).json({
        success: false,
        message: 'code, language, and focus are required'
      });
    }

    const prompt = `
You are a strict code reviewer.

Return ONLY pure JSON. No markdown, no explanation, no backticks.

Scoring rules:
- Start at 100
- Deduct 20 per critical issue
- Deduct 10 per high issue
- Deduct 5 per medium issue
- Deduct 2 per low issue
- Minimum score is 0

Return exactly this JSON structure:
{
  "score": 0,
  "summary": "string",
  "counts": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "categories": { "bestPractices": 0, "bugs": 0, "performance": 0, "security": 0 },
  "customMatch": 0,
  "issues": [
    {
      "line": 1,
      "severity": "critical",
      "type": "security",
      "description": "string",
      "suggestion": "string"
    }
  ]
}

Language: ${language}
Focus: ${JSON.stringify(focus)}
Custom Standards: ${customStandards || 'None'}

Code:
${code}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    let text = completion.choices[0].message.content;
    text = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

// fix issues array
let issues = parsed.issues;

if (typeof issues === 'string') {
  issues = JSON.parse(issues);
}

if (Array.isArray(issues) && issues.length > 0 && typeof issues[0] === 'string') {
  issues = JSON.parse(issues[0]);
}

if (!Array.isArray(issues)) {
  issues = [];
}

const cleanIssues = issues.map(issue => ({
  line: Number(issue.line),
  severity: String(issue.severity),
  type: String(issue.type),
  description: String(issue.description),
  suggestion: String(issue.suggestion),
}));

const userId = req.user.id;

await Review.create({ 
  userId, 
  code, 
  language, 
  score: parsed.score, 
  summary: parsed.summary, 
  counts: parsed.counts, 
  categories: parsed.categories, 
  customMatch: parsed.customMatch, 
  issues: JSON.parse(JSON.stringify(cleanIssues)) 
});

return res.status(200).json({
  success: true,
  ...parsed,
  issues: cleanIssues
});

  } catch (error) {
    console.error('Review code', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-code'); // don't send full code, too heavy

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
  
};


exports.fixIssues = async (req , res) => {
  try{
    console.log('Fix route hit!', req.body);
    const { code, issue } = req.body;
    if(!code ||!issue ){
      return res.status(400).json({
        success: false,
        message: "code and issue are required"
      });
    }


    const prompt = `
    You are an expert developer.
    
    Fix ONLY the specific issue described below in the code.
    Preserve the original code formatting, indentation and line breaks.
    Do NOT rewrite the entire code — only fix the specific issue.
    
    Return ONLY valid JSON with no markdown:
    {
      "fixedCode": "string with proper line breaks and indentation"
    }
    
    Issue to fix:
    ${JSON.stringify(issue)}
    
    Original code:
    ${code}
    `;

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.2, 
});

let text = completion.choices[0].message.content;
text = text.replace(/```json|```/g, '').trim();

// fix unescaped newlines inside JSON string values
text = text.replace(/"fixedCode":\s*"([\s\S]*?)"\s*\}/,  (match, code) => {
  const escaped = code.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `"fixedCode": "${escaped}"}`;
});

const parsed = JSON.parse(text);

// unescape newlines back for the actual code
const fixedCode = parsed.fixedCode.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

return res.status(200).json({
  success: true,
  fixedCode
});
  }catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
