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
];

export const DEFAULT_STUDENT_PROFILE = SEEDED_STUDENT_PROFILES[0];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-seeded-1',
    title: 'Zoho Placement Drive',
    category: 'Placement',
    priority: 'HIGH',
    description: 'Zoho is conducting an exclusive campus recruitment drive. The selection process involves core software programming, solving data structures & algorithms problem challenges, and web systems development.',
    date: '2026-09-22',
    time: '10:00 AM',
    venue: 'Seminar Hall',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS'],
      years: [3, 4],
      minCgpa: 7.0,
      skills: ['Java', 'DSA'],
      interests: ['Software Development', 'Full Stack']
    },
    deadline: '2026-09-20',
    actionRequired: 'Submit resume on Zoho portals registration link and submit verified details to College Placement Coordinator.'
  },
  {
    id: 'ann-seeded-2',
    title: 'Google AI Hackathon',
    category: 'Hackathon',
    priority: 'HIGH',
    description: 'Build creative and high-impact solutions with Generative AI at the Google AI Hackathon. Solve critical campus and national challenges using Gemini model APIs.',
    date: '2026-09-21',
    time: '08:30 AM',
    venue: 'Innovation Center',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'],
      years: [1, 2, 3, 4],
      skills: ['AI', 'Python'],
      interests: ['AI', 'Research', 'Machine Learning']
    },
    deadline: '2026-09-18',
    actionRequired: 'Form a team of 2-4 students, draft your hackathon abstract proposal and submit on Devpost Hackfest page.'
  },
  {
    id: 'ann-seeded-3',
    title: 'AWS Cloud Workshop',
    category: 'Workshop',
    priority: 'MEDIUM',
    description: 'Comprehensive boot camp on Amazon Web Services cloud infrastructure and DevOps. Get hands-on with AWS Beanstalk deployments, Docker containers, IAM, S3, and load balancers.',
    date: '2026-09-27',
    time: '01:30 PM',
    venue: 'Lab 4',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'],
      years: [1, 2, 3, 4],
      skills: ['Cloud'],
      interests: ['Cloud Computing', 'Full Stack']
    },
    deadline: '2026-09-25',
    actionRequired: 'Complete AWS Educate sign-up and RSVP on the NEC Workshop scheduler dashboard.'
  },
  {
    id: 'ann-seeded-4',
    title: 'Merit Scholarship',
    category: 'Scholarship',
    priority: 'HIGH',
    description: 'College-wide scholarship reward program for students with outstanding academic records. Completely sponsors college tuition and board fees for merit students with high CGPA standings.',
    date: '2026-09-17',
    time: '11:00 AM',
    venue: 'Admin Block',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'],
      years: [1, 2, 3, 4],
      minCgpa: 8.0
    },
    deadline: '2026-09-15',
    actionRequired: 'Prepare and compile your verified CGPA transcripts of semesters 1-4 and submit to Academic Admin Desk, Admin Block Room 202.'
  },
  {
    id: 'ann-1',
    title: 'Accenture Campus Placement Drive 2026',
    category: 'Placement',
    priority: 'HIGH',
    description: 'Accenture is visiting NEC campus for recruitment of Associate Software Engineers. Open to Final/Pre-final year students of CSE, IT, AI&DS & ECE.',
    date: '2026-06-25',
    time: '09:00 AM',
    venue: 'NEC Auditorium',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS', 'ECE'],
      years: [3, 4],
      minCgpa: 7.5,
      skills: ['SQL', 'Java', 'Python'],
      interests: ['Software Development']
    },
    deadline: '2026-06-18', // 4 days remaining
    actionRequired: 'Register on the Accenture Careers portal and upload resume to College Placement Cell.'
  },
  {
    id: 'ann-2',
    title: 'Cognizant Pre-Internship Program',
    category: 'Internship',
    priority: 'HIGH',
    description: 'A 6-month stipend internship with full-time conversion opportunities. Focused on full-stack web engineering & cloud native technologies.',
    date: '2026-07-01',
    time: '10:00 AM',
    venue: 'Online / Virtual',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS'],
      years: [3],
      minCgpa: 7.0,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      interests: ['Web Development']
    },
    deadline: '2026-06-16', // 2 days remaining (HIGH PRIORITY < 3 DAYS!)
    actionRequired: 'Apply through the Cognizant campus link on the college LMS board.'
  },
  {
    id: 'ann-3',
    title: 'National Post-Matric Merit Scholarship 2026',
    category: 'Scholarship',
    priority: 'HIGH',
    description: 'National Level Academic Merit Scholarship for talented engineering students. Reimburses 100% of tuition and research fees.',
    date: '2026-06-22',
    venue: 'NEC Academic Administration Office',
    eligibility: {
      minCgpa: 8.5
    },
    deadline: '2026-06-21', // 7 days remaining
    actionRequired: 'Submit completed application form, household income proof, and CGPA transcript sheet to Admin Room 104.'
  },
  {
    id: 'ann-4',
    title: 'NEC Hackfest 2026 (Smart Campus Hackathon)',
    category: 'Hackathon',
    priority: 'MEDIUM',
    description: '24-hour non-stop development challenge to build smart college automation utilities. Exciting cash rewards to top 3 winning teams.',
    date: '2026-06-28',
    time: '08:00 AM',
    venue: 'IT Block Lab 3',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE'],
      years: [1, 2, 3, 4],
      skills: ['React', 'TypeScript', 'Python'],
      interests: ['Web Development', 'Machine Learning']
    },
    deadline: '2026-06-24',
    actionRequired: 'Register a team of 3-4 members on the Hackfest portal.'
  },
  {
    id: 'ann-5',
    title: 'Hands-on AI and Deep Learning Workshop',
    category: 'Workshop',
    priority: 'MEDIUM',
    description: 'Comprehensive practical laboratory workshop covering Neural Networks, PyTorch, and NLP models. Organized by AI&DS Department.',
    date: '2026-06-22',
    time: '02:00 PM',
    venue: 'AI Research Lab',
    eligibility: {
      departments: ['CSE', 'IT', 'AI&DS'],
      skills: ['Python'],
      interests: ['Machine Learning']
    },
    deadline: '2026-06-19',
    actionRequired: 'Fill out the google RSVP registration form on AI&DS department website.'
  },
  {
    id: 'ann-6',
    title: 'Robotics & Automation Club Inductions',
    category: 'Club Activity',
    priority: 'MEDIUM',
    description: 'Annual recruitment and tech challenge for the NEC Robotics & Automation wing. Work on custom microcontrollers and ROS experiments.',
    date: '2026-06-20',
    time: '04:00 PM',
    venue: 'Mechanical Seminar Hall',
    eligibility: {
      departments: ['Mechanical', 'Civil', 'ECE', 'EEE'],
      years: [1, 2, 3],
      interests: ['UI/UX Design']
    },
    deadline: '2026-06-18',
    actionRequired: 'Register and download the problem statements for the offline design rounds.'
  },
  {
    id: 'ann-7',
    title: 'University Semester Lab/Practical Examinations',
    category: 'Examination',
    priority: 'HIGH',
    description: 'Official schedule published for semester practical examination boards. Students must print hall tickets and prepare lab manuals.',
    date: '2026-06-19',
    time: '08:30 AM',
    venue: 'Respective Department Labs',
    eligibility: {},
    deadline: '2026-06-17', // 3 days remaining! (Exam announcement + within 3 days -> HIGH!)
    actionRequired: 'Download hall tickets from college portal, get them attested, and complete lab record submissions.'
  },
  {
    id: 'ann-8',
    title: 'Cloud Computing Practice Assignment 3',
    category: 'Assignment',
    priority: 'HIGH',
    description: 'Deployment checklist utilizing AWS Elastic Beanstalk and Docker containers. Submit working solution logs.',
    date: '2026-06-15',
    time: '11:59 PM',
    venue: 'Online LMS Portal',
    eligibility: {
      departments: ['CSE', 'IT'],
      years: [3]
    },
    deadline: '2026-06-15', // 1 day remaining!
    actionRequired: 'Submit PDF report with cloud screenshots and GitHub repository codes link to the LMS module.'
  },
  {
    id: 'ann-9',
    title: 'NEC Green Campus Tree Plantation Drive',
    category: 'General Notice',
    priority: 'LOW',
    description: 'A community engagement green standard campaign spearheaded by the NEC NSS unit. Open to everyone.',
    date: '2026-06-18',
    time: '07:30 AM',
    venue: 'NEC Playgrounds Campus Gate B',
    eligibility: {},
    deadline: '2026-06-18',
    actionRequired: 'Turn up with comfortable athletic outfit and track. Seedlings and tools will be provided.'
  },
  {
    id: 'ann-10',
    title: 'L&T Build India Scholarship Program',
    category: 'Scholarship',
    priority: 'HIGH',
    description: 'Sponsorship for M.Tech in Construction Technology at IIT Madras/Delhi. Fully sponsored by Larsen & Toubro for core students.',
    date: '2026-07-05',
    venue: 'L&T Corporate Portal',
    eligibility: {
      departments: ['Civil', 'Mechanical'],
      years: [4],
      minCgpa: 8.0
    },
    deadline: '2026-06-25',
    actionRequired: 'Register online via L&T scholarship portal with verified UG academic reports.'
  }
];
