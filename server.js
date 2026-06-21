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

const DB_PATH = path.join(__dirname, 'db.json');

const INITIAL_DB_STATE = {
  profiles: [
    {
      name: "Immanuel",
      registerNumber: "NEC-2023-085",
      department: "CSE",
      year: 3,
      semester: 6,
      cgpa: 8.2,
      skills: ["Java", "Spring Boot", "React", "Node.js"],
      interests: ["AI", "Full Stack", "Cloud"]
    },
    {
      name: "Arun",
      registerNumber: "NEC-2022-142",
      department: "AI&DS",
      year: 4,
      semester: 8,
      cgpa: 8.8,
      skills: ["Python", "Machine Learning", "Deep Learning"],
      interests: ["AI", "Research"]
    },
    {
      name: "Priya",
      registerNumber: "NEC-2024-031",
      department: "IT",
      year: 2,
      semester: 4,
      cgpa: 8.5,
      skills: ["JavaScript", "React"],
      interests: ["Web Development"]
    }
  ],
  announcements: [
    {
      id: "ann-seeded-1",
      title: "Zoho Placement Drive",
      category: "Placement",
      priority: "HIGH",
      description: "Zoho is conducting an exclusive campus recruitment drive. The selection process involves core software programming, solving data structures & algorithms problem challenges, and web systems development.",
      date: "2026-09-22",
      time: "10:00 AM",
      venue: "Seminar Hall",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS"],
        years: [3, 4],
        minCgpa: 7.0,
        skills: ["Java", "DSA"],
        interests: ["Software Development", "Full Stack"]
      },
      deadline: "2026-09-20",
      actionRequired: "Submit resume on Zoho portals registration link and submit verified details to College Placement Coordinator."
    },
    {
      id: "ann-seeded-2",
      title: "Google AI Hackathon",
      category: "Hackathon",
      priority: "HIGH",
      description: "Build creative and high-impact solutions with Generative AI at the Google AI Hackathon. Solve critical campus and national challenges using Gemini model APIs.",
      date: "2026-09-21",
      time: "08:30 AM",
      venue: "Innovation Center",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS", "ECE", "EEE", "Mechanical", "Civil"],
        years: [1, 2, 3, 4],
        skills: ["AI", "Python"],
        interests: ["AI", "Research", "Machine Learning"]
      },
      deadline: "2026-09-18",
      actionRequired: "Form a team of 2-4 students, draft your hackathon abstract proposal and submit on Devpost Hackfest page."
    },
    {
      id: "ann-seeded-3",
      title: "AWS Cloud Workshop",
      category: "Workshop",
      priority: "MEDIUM",
      description: "Comprehensive boot camp on Amazon Web Services cloud infrastructure and DevOps. Get hands-on with AWS Beanstalk deployments, Docker containers, IAM, S3, and load balancers.",
      date: "2026-09-27",
      time: "01:30 PM",
      venue: "Lab 4",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS", "ECE", "EEE", "Mechanical", "Civil"],
        years: [1, 2, 3, 4],
        skills: ["Cloud"],
        interests: ["Cloud Computing", "Full Stack"]
      },
      deadline: "2026-09-25",
      actionRequired: "Complete AWS Educate sign-up and RSVP on the NEC Workshop scheduler dashboard."
    },
    {
      id: "ann-seeded-4",
      title: "Merit Scholarship",
      category: "Scholarship",
      priority: "HIGH",
      description: "College-wide scholarship reward program for students with outstanding academic records. Completely sponsors college tuition and board fees for merit students with high CGPA standings.",
      date: "2026-09-17",
      time: "11:00 AM",
      venue: "Admin Block",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS", "ECE", "EEE", "Mechanical", "Civil"],
        years: [1, 2, 3, 4],
        minCgpa: 8.0
      },
      deadline: "2026-09-15",
      actionRequired: "Prepare and compile your verified CGPA transcripts of semesters 1-4 and submit to Academic Admin Desk, Admin Block Room 202."
    },
    {
      id: "ann-1",
      title: "Accenture Campus Placement Drive 2026",
      category: "Placement",
      priority: "HIGH",
      description: "Accenture is visiting NEC campus for recruitment of Associate Software Engineers. Open to Final/Pre-final year students of CSE, IT, AI&DS & ECE.",
      date: "2026-06-25",
      time: "09:00 AM",
      venue: "NEC Auditorium",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS", "ECE"],
        years: [3, 4],
        minCgpa: 7.5,
        skills: ["SQL", "Java", "Python"],
        interests: ["Software Development"]
      },
      deadline: "2026-06-18",
      actionRequired: "Register on the Accenture Careers portal and upload resume to College Placement Cell."
    },
    {
      id: "ann-2",
      title: "Cognizant Pre-Internship Program",
      category: "Internship",
      priority: "HIGH",
      description: "A 6-month stipend internship with full-time conversion opportunities. Focused on full-stack web engineering & cloud native technologies.",
      date: "2026-07-01",
      time: "10:00 AM",
      venue: "Online / Virtual",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS"],
        years: [3],
        minCgpa: 7.0,
        skills: ["React", "TypeScript", "Tailwind CSS"],
        interests: ["Web Development"]
      },
      deadline: "2026-06-16",
      actionRequired: "Apply through the Cognizant campus link on the college LMS board."
    },
    {
      id: "ann-3",
      title: "National Post-Matric Merit Scholarship 2026",
      category: "Scholarship",
      priority: "HIGH",
      description: "National Level Academic Merit Scholarship for talented engineering students. Reimburses 100% of tuition and research fees.",
      date: "2026-06-22",
      venue: "NEC Academic Administration Office",
      eligibility: {
        minCgpa: 8.5
      },
      deadline: "2026-06-21",
      actionRequired: "Submit completed application form, household income proof, and CGPA transcript sheet to Admin Room 104."
    },
    {
      id: "ann-4",
      title: "NEC Hackfest 2026 (Smart Campus Hackathon)",
      category: "Hackathon",
      priority: "MEDIUM",
      description: "24-hour non-stop development challenge to build smart college automation utilities. Exciting cash rewards to top 3 winning teams.",
      date: "2026-06-28",
      time: "08:00 AM",
      venue: "IT Block Lab 3",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS", "ECE", "EEE"],
        years: [1, 2, 3, 4],
        skills: ["React", "TypeScript", "Python"],
        interests: ["Web Development", "Machine Learning"]
      },
      deadline: "2026-06-24",
      actionRequired: "Register a team of 3-4 members on the Hackfest portal."
    },
    {
      id: "ann-5",
      title: "Hands-on AI and Deep Learning Workshop",
      category: "Workshop",
      priority: "MEDIUM",
      description: "Comprehensive practical laboratory workshop covering Neural Networks, PyTorch, and NLP models. Organized by AI&DS Department.",
      date: "2026-06-22",
      time: "02:00 PM",
      venue: "AI Research Lab",
      eligibility: {
        departments: ["CSE", "IT", "AI&DS"],
        skills: ["Python"],
        interests: ["Machine Learning"]
      },
      deadline: "2026-06-19",
      actionRequired: "Fill out the google RSVP registration form on AI&DS department website."
    },
    {
      id: "ann-6",
      title: "Robotics & Automation Club Inductions",
      category: "Club Activity",
      priority: "MEDIUM",
      description: "Annual recruitment and tech challenge for the NEC Robotics & Automation wing. Work on custom microcontrollers and ROS experiments.",
      date: "2026-06-20",
      time: "04:05 PM",
      venue: "Mechanical Seminar Hall",
      eligibility: {
        departments: ["Mechanical", "Civil", "ECE", "EEE"],
        years: [1, 2, 3],
        interests: ["UI/UX Design"]
      },
      deadline: "2026-06-18",
      actionRequired: "Register and download the problem statements for the offline design rounds."
    },
    {
      id: "ann-7",
      title: "University Semester Lab/Practical Examinations",
      category: "Examination",
      priority: "HIGH",
      description: "Official schedule published for semester practical examination boards. Students must print hall tickets and prepare lab manuals.",
      date: "2026-06-19",
      time: "08:30 AM",
      venue: "Respective Department Labs",
      eligibility: {},
      deadline: "2026-06-17",
      actionRequired: "Download hall tickets from college portal, get them attested, and complete lab record submissions."
    },
    {
      id: "ann-8",
      title: "Cloud Computing Practice Assignment 3",
      category: "Assignment",
      priority: "HIGH",
      description: "Deployment checklist utilizing AWS Elastic Beanstalk and Docker containers. Submit working solution logs.",
      date: "2026-06-15",
      time: "11:59 PM",
      venue: "Online LMS Portal",
      eligibility: {
        departments: ["CSE", "IT"],
        years: [3]
      },
      deadline: "2026-06-15",
      actionRequired: "Submit PDF report with cloud screenshots and GitHub repository codes link to the LMS module."
    },
    {
      id: "ann-9",
      title: "NEC Green Campus Tree Plantation Drive",
      category: "General Notice",
      priority: "LOW",
      description: "A community engagement green standard campaign spearheaded by the NEC NSS unit. Open to everyone.",
      date: "2026-06-18",
      time: "07:30 AM",
      venue: "NEC Playgrounds Campus Gate B",
      eligibility: {},
      deadline: "2026-06-18",
      actionRequired: "Turn up with comfortable athletic outfit and track. Seedlings and tools will be provided."
    },
    {
      id: "ann-10",
      title: "L&T Build India Scholarship Program",
      category: "Scholarship",
      priority: "HIGH",
      description: "Sponsorship for M.Tech in Construction Technology at IIT Madras/Delhi. Fully sponsored by Larsen & Toubro for core students.",
      date: "2026-07-05",
      venue: "L&T Corporate Portal",
      eligibility: {
        departments: ["Civil", "Mechanical"],
        years: [4],
        minCgpa: 8.0
      },
      deadline: "2026-06-25",
      actionRequired: "Register online via L&T scholarship portal with verified UG academic reports."
    }
  ],
  "placementPipelines": [
    {
      "companyName": "Accenture",
      "status": "Preparing",
      "dateApplied": "2026-06-12"
    },
    {
      "companyName": "Cognizant",
      "status": "Applied",
      "dateApplied": "2026-06-14"
    }
  ]
};

async function readDb() {
  try {
    const data = await fs.promises.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return INITIAL_DB_STATE;
  }
}

async function writeDb(data) {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
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

// 3. Get announcements list
app.get('/api/announcements', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.announcements || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read announcements' });
  }
});

// 4. Save/Post a new announcement
app.post('/api/announcements', async (req, res) => {
  try {
    const newAnn = req.body;
    if (!newAnn || !newAnn.id) {
      return res.status(400).json({ error: 'Invalid announcement payload' });
    }
    const db = await readDb();
    db.announcements = [newAnn, ...(db.announcements || [])];
    await writeDb(db);
    res.json({ success: true, announcements: db.announcements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write announcement' });
  }
});

// 5. Get profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.profiles || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read profiles' });
  }
});

// 6. Update student profile
app.put('/api/profile', async (req, res) => {
  try {
    const updatedProfile = req.body;
    if (!updatedProfile || !updatedProfile.name) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }
    const db = await readDb();
    const index = db.profiles.findIndex(p => p.name.toLowerCase() === updatedProfile.name.toLowerCase());
    if (index !== -1) {
      db.profiles[index] = updatedProfile;
    } else {
      db.profiles.push(updatedProfile);
    }
    await writeDb(db);
    res.json({ success: true, profile: updatedProfile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 7. Get placement pipelines
app.get('/api/pipelines', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.placementPipelines || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read pipelines' });
  }
});

// 8. Save placement pipelines
app.post('/api/pipelines', async (req, res) => {
  try {
    const pipelines = req.body;
    const db = await readDb();
    db.placementPipelines = pipelines;
    await writeDb(db);
    res.json({ success: true, placementPipelines: db.placementPipelines });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save pipelines' });
  }
});

// 9. Reset database back to default initial state
app.post('/api/reset', async (req, res) => {
  try {
    await writeDb(INITIAL_DB_STATE);
    res.json({ success: true, message: 'Database reset to default seeded state' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset database' });
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
