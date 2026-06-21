import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Groq Client
const apiKey = process.env.GROQ_API_KEY;
let groq = null;
if (apiKey) {
  groq = new Groq({ apiKey });
} else {
  console.warn("GROQ_API_KEY environment variable is not defined.");
}

// Helper to calculate Match Score on server side if needed
function calculateScore(profile, item) {
  let score = 0;
  
  // Department match
  const itemDepts = item.eligibility?.departments || [];
  if (itemDepts.length === 0 || itemDepts.includes(profile.department)) {
    score += 30;
  }

  // Year match
  const itemYears = item.eligibility?.years || [];
  if (itemYears.length === 0 || itemYears.includes(profile.year)) {
    score += 20;
  }

  // CGPA match
  const minCgpa = item.eligibility?.minCgpa || 0;
  if (profile.cgpa >= minCgpa) {
    score += 20;
  }

  // Skill match
  const itemSkills = item.eligibility?.skills || [];
  const hasSkillMatch = itemSkills.some(s => 
    profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
  );
  if (hasSkillMatch) {
    score += 20;
  }

  // Interest match
  const itemInterests = item.eligibility?.interests || [];
  const hasInterestMatch = itemInterests.some(i => 
    profile.interests.some(pi => pi.toLowerCase() === i.toLowerCase())
  );
  if (hasInterestMatch) {
    score += 10;
  }

  return score;
}

// API Routes

// 1. Chatbot powered by Groq
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, profile, announcements } = req.body;

    if (!groq) {
      return res.status(500).json({ error: 'Groq client could not be initialized due to missing GROQ_API_KEY.' });
    }

    // Process matching scores for reference
    const rankedAnnouncements = announcements.map(ann => {
      const score = calculateScore(profile, ann);
      return { ...ann, score };
    }).sort((a, b) => b.score - a.score);

    // Format announcements context for Groq
    const contextString = rankedAnnouncements.map(ann => {
      return `ID: ${ann.id}
Event: ${ann.title}
Category: ${ann.category}
Priority: ${ann.priority}
Score: ${ann.score} Match Points
Description: ${ann.description}
Date: ${ann.date || 'TBD'}
Venue: ${ann.venue || 'Online / Physical'}
Eligibility: Depts: ${ann.eligibility?.departments?.join(', ') || 'All'}, Year: ${ann.eligibility?.years?.join(', ') || 'All'}, Min CGPA: ${ann.eligibility?.minCgpa || 'None'}, Skills: ${ann.eligibility?.skills?.join(', ') || 'None'}, Interests: ${ann.eligibility?.interests?.join(', ') || 'None'}
Deadline: ${ann.deadline}
Action Required: ${ann.actionRequired}`;
    }).join('\n\n');

    const systemInstruction = `You are CampusAssist AI, the intelligent friendly campus assistant for National Engineering College (NEC).
You are speaking to ${profile.name}, a Year ${profile.year} student in the ${profile.department} department (Semester ${profile.semester}, CGPA ${profile.cgpa}).
The student's skills are: ${profile.skills.join(', ')}.
Their interests are: ${profile.interests.join(', ')}.

Your goals:
- Help students discover relevant opportunities, answer campus-related questions, prioritize announcements, and provide deadline reminders.
- Reduce information overload.
- Rank and recommend opportunities strictly prioritizing the student-specific matched ones. Let them know if it matches their profile and explain matching scores.

Personalization Scoring rules:
- Department Match = +30 (if target department list is empty, it matches all)
- Year Match = +20 (if target year list is empty, it matches all)
- CGPA Match = +20 (if student's CGPA is >= minimum CGPA required)
- Skill Match = +20 (if student has at least one matching skill)
- Interest Match = +10 (if student has at least one matching interest)
Score ranges from 0 to 100.

Announcements & Opportunities currently active:
${contextString}

Response Style:
- Be concise, clear, and student-friendly.
- Use bullet points.
- Highlight deadlines clearly (e.g. use **BOLD**).
- Mention urgency when deadlines are close (especially inside 3 days).
- Stay in character as the NEC CampusAssist AI assistant.
- Never suggest opportunities that do not exist in the announcements database.
- If asked "Show scholarships for final year students" or any subset, filter the list correctly and display them.

Required Response Block format when highlighting or recommending specific items (use exactly this block to describe items):
Category: [Category]
Priority: [Priority]
Summary: [Brief core description]
Eligibility: [Who can apply]
Deadline: [Deadline date]
Recommended For: [Why this fits them, mentioning score or matching parameter]
Action Required: [What concrete action is needed]`;

    // Map history to OpenAI/Groq format
    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    (history || []).forEach(h => {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      messages.push({
        role: role,
        content: h.text || h.content || ''
      });
    });

    messages.push({
      role: 'user',
      content: message
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate response' });
  }
});

// 2. Deadline Extraction from raw text
app.post('/api/extract', async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!groq) {
      return res.status(500).json({ error: 'Groq client could not be initialized due to missing GROQ_API_KEY.' });
    }

    const extractionInstruction = `You are a strict data extraction processor for CampusAssist AI.
Your task is to take any unformatted, raw notice/announcement message from National Engineering College and extract structured fields about deadlines and events.

You must categorize the announcement into one of the following exact categories:
1. Placement
2. Internship
3. Scholarship
4. Event
5. Workshop
6. Hackathon
7. Examination
8. Assignment
9. Club Activity
10. General Notice

Priority Rules:
- HIGH: Deadline within 3 days, OR Placement Drive, OR Internship Deadline, OR Scholarship Deadline, OR Exam Announcement.
- MEDIUM: Workshop, Hackathon, Club Events.
- LOW: General Notices.

Output your reply strictly as a JSON object matching this schema structure:
{
  "title": "Title of the Event/Announcement",
  "category": "One of the 10 categories above",
  "priority": "HIGH, MEDIUM, or LOW",
  "description": "Short explanation of the notice",
  "date": "Date of Event/Exam (e.g. YYYY-MM-DD or Month DD, YYYY if not specified exact)",
  "time": "Time of event if any",
  "venue": "Venue of the event if any specified",
  "eligibility": {
    "departments": ["CSE", "IT", etc. - array of matching departments, or empty if general],
    "years": [1, 2, 3, 4 - array of numbers, or empty if general],
    "minCgpa": 7.5 (number or null),
    "skills": ["Python", etc. - array or empty],
    "interests": ["Machine Learning", etc. - array or empty]
  },
  "deadline": "Deadline to apply/submit (format: YYYY-MM-DD)",
  "actionRequired": "Concrete step the student needs to take"
}

If critical details aren't specified, write intelligent defaults (e.g. "All students eligible" or current year). Ensure it parses to valid JSON.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: extractionInstruction },
        { role: 'user', content: `Raw notice body:\n"${rawText}"\n\nPlease extract instructions as structured JSON.` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsedData = JSON.parse(response.choices[0]?.message?.content || '{}');
    res.json(parsedData);
  } catch (err) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: err?.message || 'Failed to extract data correctly' });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    // Support SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusAssist AI Backend listening on http://localhost:${PORT}`);
  });
}

startServer();
