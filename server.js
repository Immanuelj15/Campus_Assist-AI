import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import multer from 'multer';
import * as xlsx from 'xlsx';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
  getAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  addRawAnnouncement,
  getRawAnnouncements,
  getProfiles,
  updateProfile,
  getPipelines,
  savePipelines,
  getNotifications,
  addNotification,
  clearNotifications,
  seedDatabase
} from './server_db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Prevent browser caching for all API endpoints to guarantee dynamic responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Configure Multer for File Uploads (uploads/ folder)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Initialize Groq Client
const apiKey = process.env.GROQ_API_KEY;
let groq = null;
if (apiKey) {
  groq = new Groq({ apiKey });
} else {
  console.warn("GROQ_API_KEY environment variable is not defined.");
}

// JWT Configurations
const JWT_SECRET = process.env.JWT_SECRET || 'campus_assist_super_secret_token';

// Simple JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    // If no token, check if client requested dynamic role switcher mode (for hackathon testing)
    const mockRole = req.headers['x-mock-role'];
    const mockUser = req.headers['x-mock-user'];
    if (mockRole) {
      req.user = { username: mockUser || 'Immanuel', role: mockRole };
      return next();
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Helper: Run Raw notice through Groq AI classification and structure generator
async function processRawNoticeWithAI(rawText) {
  if (!groq) {
    throw new Error('Groq client not initialized. Check your GROQ_API_KEY.');
  }

  const prompt = `You are a strict data extraction processor for CampusAssist AI.
Your task is to take any unstructured notice, email, text or announcement and extract structured fields about deadlines and events.

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
  "date": "Date of Event/Exam (e.g. YYYY-MM-DD or Month DD, YYYY if not specified)",
  "time": "Time of event if specified",
  "venue": "Venue of the event if specified",
  "eligibility": {
    "departments": ["CSE", "IT", "AI&DS", etc. - array of matching departments, or empty if general],
    "years": [1, 2, 3, 4 - array of numbers, or empty if general],
    "minCgpa": 7.5 (number or null),
    "skills": ["Python", etc. - array or empty],
    "interests": ["Machine Learning", etc. - array or empty]
  },
  "deadline": "Deadline to apply/submit (format: YYYY-MM-DD)",
  "actionRequired": "Concrete step the student needs to take",
  "summary": "One line brief summary of the entire notice",
  "keywords": ["Placement", "CSE", "Zoho", etc. - array of 5-8 search tags]
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: `Raw Notice body:\n"${rawText}"\n\nPlease structure this.` }
    ],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}

// REST ENDPOINTS

// 1. Authentication APIs
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // In our fallbacks or MongoDB setup, we can save user credentials.
    // For local ease, we just generate a JWT for registered credentials
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role, username });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Simple placeholder credentials logic for Hackathon purposes
    // Admin login or standard user logins
    let role = 'student';
    if (username.toLowerCase().includes('faculty') || username.toLowerCase() === 'teacher') {
      role = 'faculty';
    } else if (username.toLowerCase().includes('admin') || username.toLowerCase() === 'principal') {
      role = 'admin';
    }
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role, username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2. Fetch/Create Announcements (REST)
app.get('/api/announcements', async (req, res) => {
  try {
    const list = await getAnnouncements();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve announcements' });
  }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    // AI Ingestion: Send text raw announcement or save direct
    let processedAnn = { ...payload };
    if (!payload.id) {
      processedAnn.id = `ann-manual-${Date.now()}`;
    }
    const updated = await addAnnouncement(processedAnn);
    
    // Automatically dispatch an in-app notice notification to everyone eligible
    await addNotification({
      studentName: 'All',
      title: `New notice published: ${processedAnn.title}`,
      body: processedAnn.summary || processedAnn.description.slice(0, 100),
      type: 'in-app',
      deadline: processedAnn.deadline
    });

    res.json({ success: true, announcements: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
});

app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const list = await deleteAnnouncement(req.params.id);
    res.json({ success: true, announcements: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

app.put('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const list = await updateAnnouncement(req.params.id, req.body);
    res.json({ success: true, announcements: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// AI Extract notice endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: 'rawText query is required' });
    }
    const aiProcessed = await processRawNoticeWithAI(rawText);
    res.json(aiProcessed);
  } catch (err) {
    res.status(500).json({ error: err.message || 'AI extraction failed' });
  }
});

// Retrieve raw log announcements
app.get('/api/raw-announcements', async (req, res) => {
  try {
    const list = await getRawAnnouncements();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve raw announcements' });
  }
});

// 3. User & Student Profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const list = await getProfiles();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profiles' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const updatedList = await updateProfile(req.body);
    res.json({ success: true, profiles: updatedList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// 4. File uploads & PDF/Docx Extraction
app.post('/api/faculty/upload', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file attachment uploaded' });
    }
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Extracted raw text mock based on filename to simulate document parsing
    let mockExtractedText = `This is a raw notice from Faculty Portal regarding an upcoming placement session at NEC.
Company Name: Amazon Web Services.
Event: AWS Cloud Engineering recruitment workshop.
Venue: Seminar Hall 2.
Eligibility: 3rd and 4th years in CSE, IT, ECE.
Min CGPA Required: 8.0.
Deadline to apply is 2026-06-28.
Action Required: Upload resume on AWS careers portal.`;

    if (fileExt === '.xlsx' || fileExt === '.xls') {
      mockExtractedText += ` This contains tabular placement schedules for final year students.`;
    }

    // Pass through Groq AI classification pipeline
    const aiProcessed = await processRawNoticeWithAI(mockExtractedText);
    aiProcessed.id = `ann-upload-${Date.now()}`;
    
    // Save to raw collection
    await addRawAnnouncement(mockExtractedText, 'faculty');
    
    // Save to processed collection
    const list = await addAnnouncement(aiProcessed);

    res.json({ success: true, announcement: aiProcessed, announcements: list });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'File upload Ingestion failed' });
  }
});

// 5. Excel/CSV bulk import
app.post('/api/faculty/import-csv', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV/Excel sheet uploaded' });
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Parse each row, validate, structure it, and process with Groq if needed
    const processedAnnouncements = [];
    for (const row of sheetData) {
      const title = row.Title || row.title || 'Untitled Excel Notice';
      const description = row.Description || row.description || 'No description provided';
      const deadline = row.Deadline || row.deadline || '2026-06-30';
      const category = row.Category || row.category || 'General Notice';
      const priority = row.Priority || row.priority || 'MEDIUM';
      
      const newAnn = {
        id: `ann-csv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        category,
        priority,
        description,
        venue: row.Venue || row.venue || 'NEC Campus',
        eligibility: {
          departments: row.Departments ? row.Departments.split(',') : [],
          years: row.Years ? row.Years.split(',').map(Number) : [3, 4],
          minCgpa: row.MinCgpa ? parseFloat(row.MinCgpa) : null
        },
        deadline,
        actionRequired: row.Action || row.action || 'Apply on college dashboard.'
      };
      
      await addAnnouncement(newAnn);
      processedAnnouncements.push(newAnn);
    }

    const currentList = await getAnnouncements();
    res.json({ success: true, count: processedAnnouncements.length, announcements: currentList });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Excel import processing failed' });
  }
});

// 6. LMS Integration sync endpoint
app.get('/api/lms/sync', async (req, res) => {
  try {
    // Simulated LMS REST Pull (Canvas/Moodle Notice Board payload)
    const mockLMSNotice = `Moodle LMS Announcement: Semester End Assignment submission checklist for Third Year Computer Science students.
Please upload Assignment 4 of Computer Networks on the portal.
Deadline: 2026-06-25.
Department: CSE, IT.
Action: Upload PDF files.`;

    const aiProcessed = await processRawNoticeWithAI(mockLMSNotice);
    aiProcessed.id = `ann-lms-${Date.now()}`;
    
    await addRawAnnouncement(mockLMSNotice, 'lms');
    const list = await addAnnouncement(aiProcessed);

    res.json({ success: true, announcement: aiProcessed, announcements: list });
  } catch (err) {
    res.status(500).json({ error: err.message || 'LMS Integration failed' });
  }
});

// 7. Email Ingestion Trigger API
app.get('/api/emails/sync', async (req, res) => {
  try {
    const mockEmailText = `Subject: Internship openings at Microsoft India research labs.
Microsoft is looking for research engineering intern applicants who are familiar with machine learning and python scripting.
Minimum CGPA required is 8.5. CSE/IT branch only.
Submit profiles by 2026-06-27 on Microsoft research careers link.`;

    const aiProcessed = await processRawNoticeWithAI(mockEmailText);
    aiProcessed.id = `ann-email-${Date.now()}`;

    await addRawAnnouncement(mockEmailText, 'email');
    const list = await addAnnouncement(aiProcessed);

    res.json({ success: true, announcement: aiProcessed, announcements: list });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Email Ingestion failed' });
  }
});

// Email background checker mock (Every 10 minutes)
setInterval(async () => {
  try {
    if (groq) {
      const mockEmailText = `Subject: Semester examination practical schedules.
University exams scheduled from June 24 onwards. Apply for halls tickets immediately.`;
      const aiProcessed = await processRawNoticeWithAI(mockEmailText);
      aiProcessed.id = `ann-email-sched-${Date.now()}`;
      await addRawAnnouncement(mockEmailText, 'email');
      await addAnnouncement(aiProcessed);
      console.log('✓ Simulated email background poller executed successfully.');
    }
  } catch (e) {
    console.error('Email scheduler error:', e.message);
  }
}, 10 * 60 * 1000);

// 8. Smart Notification Engine (Calculates hours/days remaining and schedules reminders)
app.get('/api/notifications/reminders', async (req, res) => {
  try {
    const announcements = await getAnnouncements();
    const currTime = new Date('2026-06-14').getTime(); // System Mock Date

    let count = 0;
    for (const ann of announcements) {
      const deadlineTime = new Date(ann.deadline).getTime();
      const diffTime = deadlineTime - currTime;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining >= 0 && [1, 3, 7].includes(daysRemaining)) {
        await addNotification({
          studentName: 'All',
          title: `⚠️ Deadline Approaching: ${ann.title}`,
          body: `Only ${daysRemaining} days left to apply! Action: ${ann.actionRequired}`,
          type: 'push',
          deadline: ann.deadline
        });
        count++;
      }
    }
    const notifs = await getNotifications();
    res.json({ success: true, remindersSent: count, notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run notifications reminder engine' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const list = await getNotifications();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const list = await clearNotifications();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// 9. Placement Pipelines
app.get('/api/pipelines', async (req, res) => {
  try {
    const list = await getPipelines();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load pipelines' });
  }
});

app.post('/api/pipelines', async (req, res) => {
  try {
    const list = await savePipelines(req.body);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save pipelines' });
  }
});

// 10. AI Chatbot with TF-IDF Keyword Match RAG
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, profile, announcements } = req.body;

    if (!groq) {
      return res.status(500).json({ error: 'Groq client could not be initialized due to missing GROQ_API_KEY.' });
    }

    // TF-IDF / RAG Keyword Intersection Retrieval
    // Search words from query message
    const searchTerms = message.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    // Score each announcement based on intersection with keywords/title/description
    const scoredDocs = announcements.map(ann => {
      let matchScore = 0;
      const textToSearch = `${ann.title} ${ann.category} ${ann.description} ${ann.actionRequired} ${ann.keywords?.join(' ') || ''}`.toLowerCase();
      
      searchTerms.forEach(term => {
        if (textToSearch.includes(term)) matchScore += 10;
        if (ann.title.toLowerCase().includes(term)) matchScore += 20; // weight title matches higher
      });
      
      return { ann, matchScore };
    });

    // Retrieve top 5 documents
    const retrievedDocs = scoredDocs
      .filter(d => d.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map(d => d.ann);

    // Build context string from RAG results
    let contextString = '';
    if (retrievedDocs.length > 0) {
      contextString = retrievedDocs.map(ann => {
        return `Event: ${ann.title} | Category: ${ann.category} | Deadline: ${ann.deadline} | Description: ${ann.description} | Action Required: ${ann.actionRequired} | Venue: ${ann.venue || 'NEC Campus'}`;
      }).join('\n\n');
    } else {
      contextString = 'No direct matches found in announcements database. Rely on general guidelines.';
    }

    const systemInstruction = `You are CampusAssist AI, the intelligent friendly campus counselor assistant for National Engineering College (NEC).
You are speaking to ${profile.name}, a Year ${profile.year} student in the ${profile.department} department (Semester ${profile.semester}, CGPA ${profile.cgpa}).

RULES:
- Never answer using general internet knowledge.
- Answer ONLY using the retrieved MongoDB document context below. If the answer is not in the context, politely state you do not know.
- Filter recommendations strictly prioritizing matched ones.

RETRIEVED CONTEXT DOCUMENTS:
${contextString}

Response Style:
- Be concise, clear, and student-friendly.
- Use bullet points.
- Highlight deadlines clearly (e.g. use **BOLD**).
- Stay in character as the NEC CampusAssist AI assistant.`;

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
      temperature: 0.5
    });

    const reply = completion.choices[0]?.message?.content || '';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate response' });
  }
});

// 11. Full Database Reseed API (Faculty/Admin utility)
app.post('/api/reset', async (req, res) => {
  try {
    // Complete Seed DB payload mock loader
    const mockSeedData = {
      profiles: [
        {
          name: "Arun",
          registerNumber: "NEC-2022-142",
          department: "AI&DS",
          year: 4,
          semester: 8,
          cgpa: 8.8,
          skills: ["Python", "Machine Learning", "Deep Learning"],
          interests: ["AI", "Research"],
          bookmarkedCategories: [],
          previousSearches: []
        },
        {
          name: "Priya",
          registerNumber: "NEC-2024-031",
          department: "IT",
          year: 2,
          semester: 4,
          cgpa: 8.5,
          skills: ["JavaScript", "React"],
          interests: ["Web Development"],
          bookmarkedCategories: [],
          previousSearches: []
        }
      ],
      announcements: [],
      placementPipelines: []
    };

    await seedDatabase(mockSeedData);
    res.json({ success: true, message: 'Database state reset and re-seeded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Reseed logic failed' });
  }
});

// Vite Middleware & Static Serves
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusAssist AI Backend listening on http://localhost:${PORT}`);
  });
}

startServer();
