export const DEPARTMENTS = ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'];

export const CATEGORIES = [
  'Placement',
  'Internship',
  'Scholarship',
  'Event',
  'Workshop',
  'Hackathon',
  'Examination',
  'Assignment',
  'Club Activity',
  'General Notice'
];

export const SUGGESTED_QUERIES = [
  "What companies are visiting next week?",
  "Any internships for AI students?",
  "What deadlines are due this week?",
  "Show scholarships for final year students.",
  "List upcoming workshops.",
  "What events are happening tomorrow?"
];

// Current date of the system is June 14, 2026
export const CURRENT_DATE_STR = '2026-06-14';

export const SEEDED_STUDENT_PROFILES = [
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
];

export const DEFAULT_STUDENT_PROFILE = SEEDED_STUDENT_PROFILES[0];

export const INITIAL_ANNOUNCEMENTS = [];
