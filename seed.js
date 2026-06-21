import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from './server_db.js';

dotenv.config();

const DEPARTMENTS = ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'];
const SKILLS = [
  'Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js', 
  'Spring Boot', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Machine Learning', 
  'Deep Learning', 'Data Structures', 'Algorithms', 'Tailwind CSS', 'Git'
];
const INTERESTS = [
  'Web Development', 'AI/ML', 'Cloud Computing', 'Cyber Security', 
  'Robotics', 'Full Stack Development', 'Research', 'Mobile App Development'
];
const MOCK_NAMES = [
  'Immanuel', 'Arun', 'Priya', 'Rahul', 'Keerthana', 'Siddharth', 'Divya', 'Vijay',
  'Deepika', 'Hari', 'Ananya', 'Rohan', 'Sneha', 'Manoj', 'Aswathy', 'Ganesh',
  'Kavitha', 'Vikram', 'Meera', 'Rithvik', 'Srinivasan', 'Abirami', 'Karthik',
  'Samyuktha', 'Pranav', 'Nisha', 'Aakash', 'Shruthi', 'Sanjay', 'Pooja',
  'Aditya', 'Reya', 'Harish', 'Swetha', 'Naveen', 'Pavithra', 'Dinesh', 'Sandhya',
  'Varun', 'Shalini', 'Kiran', 'Nandini', 'Vivek', 'Lakshmi', 'Arvind', 'Gayathri',
  'Roshan', 'Uma', 'Ajay', 'Janani', 'Babu', 'Ramya', 'Suresh', 'Geetha',
  'Ramesh', 'Aisha', 'Mustafa', 'Sarah', 'Daniel', 'Sophia', 'James', 'Olivia',
  'John', 'Emily', 'Robert', 'Grace', 'Michael', 'Chloe', 'William', 'Zoe',
  'Dev', 'Tara', 'Kabir', 'Riya', 'Ishaan', 'Diya', 'Arjun', 'Kiara', 'Aarav',
  'Anika', 'Vihaan', 'Nisha', 'Aditi', 'Dhruv', 'Sanya', 'Neil', 'Kriti', 'Yash',
  'Prisha', 'Ranbir', 'Alia', 'Varun', 'Kriti', 'Siddharth', 'Kiara', 'Kartik',
  'Sara', 'Ayushmann', 'Ananya', 'Vicky', 'Katrina', 'Ranveer', 'Deepika'
];

const COMPANIES = ['Zoho', 'Google', 'Microsoft', 'Accenture', 'TCS', 'Cognizant', 'Infosys', 'Wipro', 'Amazon', 'L&T', 'NVIDIA', 'Intel'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const CATEGORIES = [
  'Placement', 'Internship', 'Scholarship', 'Event', 'Workshop', 
  'Hackathon', 'Examination', 'Assignment', 'Club Activity', 'General Notice'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray(arr, minSize = 1, maxSize = 4) {
  const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

function generateStudents() {
  const students = [];
  for (let i = 0; i < 100; i++) {
    const name = MOCK_NAMES[i % MOCK_NAMES.length] + (i >= MOCK_NAMES.length ? ` ${Math.floor(i / MOCK_NAMES.length)}` : '');
    const regNo = `NEC-2023-${(100 + i).toString()}`;
    const department = getRandomElement(DEPARTMENTS);
    const year = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const semester = year * 2 - (Math.random() > 0.5 ? 1 : 0);
    const cgpa = parseFloat((7.0 + Math.random() * 2.8).toFixed(2)); // 7.0 to 9.8
    const studentSkills = getRandomSubarray(SKILLS, 2, 5);
    const studentInterests = getRandomSubarray(INTERESTS, 2, 4);

    students.push({
      name,
      registerNumber: regNo,
      department,
      year,
      semester,
      cgpa,
      skills: studentSkills,
      interests: studentInterests,
      bookmarkedCategories: [],
      previousSearches: []
    });
  }
  return students;
}

function generateAnnouncements() {
  const announcements = [];
  const startMockDate = new Date('2026-06-15');
  
  for (let i = 0; i < 100; i++) {
    const category = getRandomElement(CATEGORIES);
    const company = getRandomElement(COMPANIES);
    const departmentCriteria = getRandomSubarray(DEPARTMENTS, 1, 3);
    const yearsCriteria = getRandomSubarray([1, 2, 3, 4], 1, 3);
    const minCgpa = Math.random() > 0.3 ? parseFloat((6.5 + Math.random() * 2.0).toFixed(1)) : null;
    const requiredSkills = getRandomSubarray(SKILLS, 1, 3);
    const requiredInterests = getRandomSubarray(INTERESTS, 1, 2);

    // Target a date between June 2026 and Dec 2026
    const deadlineDaysOffset = Math.floor(Math.random() * 60) + 1; // 1 to 60 days
    const deadlineDate = new Date(startMockDate.getTime() + deadlineDaysOffset * 24 * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toISOString().split('T')[0];

    const eventDate = new Date(deadlineDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const eventDateStr = eventDate.toISOString().split('T')[0];

    let title = '';
    let description = '';
    let actionRequired = '';
    let priority = 'MEDIUM';
    let venue = getRandomElement(['Seminar Hall 1', 'Auditorium', 'IT Block Lab 2', 'Main Building Hall B', 'Virtual Teams Meet', 'CSE Block Seminar Room']);

    if (category === 'Placement') {
      title = `${company} Campus Placement Recruitment Drive 2026`;
      description = `${company} is recruiting software developers, product managers, and system analysts. Selection stages include coding assessment and technical interviews.`;
      actionRequired = `Register on ${company} career portal and submit your credentials to college Placement Officer.`;
      priority = 'HIGH';
    } else if (category === 'Internship') {
      title = `${company} Summer Internship Program`;
      description = `A 6-month hands-on industry experience internship at ${company} for pre-final year students. Opportunity for full time job pre-placement offer based on performance review.`;
      actionRequired = `Submit resume in PDF format on LMS placement link before deadline.`;
      priority = 'HIGH';
    } else if (category === 'Scholarship') {
      title = `${company} Academic Merit Scholarship Award`;
      description = `Scholarship opportunity offering partial or full tuition cost support for engineering students demonstrating high academic records and project works.`;
      actionRequired = `Download scholarship forms from Admin portal, attach CGPA transcripts, and submit to Office Room 101.`;
      priority = 'HIGH';
    } else if (category === 'Event') {
      title = `NEC National Technical Symposium 2026`;
      description = `Annual college wide inter-collegiate symposium featuring paper presentation, debugging contests, web dev hackathons, and design challenges.`;
      actionRequired = `Register your team on the symposium site and pay the entry ticket.`;
      priority = 'MEDIUM';
    } else if (category === 'Workshop') {
      title = `Hands-on Workshop on ${getRandomElement(SKILLS)} and Modern Best Practices`;
      description = `An intensive 2-day practical session on deployment and production guidelines, organized by department tech club advisors.`;
      actionRequired = `Fill out registration form on department dashboard. Limited seats available.`;
      priority = 'MEDIUM';
    } else if (category === 'Hackathon') {
      title = `NEC Smart Campus Generative AI Hackathon`;
      description = `Build creative automation utilities and dashboards. Team size 2-4 students. Cash prizes for winners.`;
      actionRequired = `Create a devpost submission and register team on Devpost hackfest portal.`;
      priority = 'HIGH';
    } else if (category === 'Examination') {
      title = `Semester Final Theory & Lab Board Examinations`;
      description = `The official university board schedules for theory exams and practical exams have been published. Attendance is mandatory.`;
      actionRequired = `Attest your hall ticket registration slip and complete record submission.`;
      priority = 'HIGH';
    } else if (category === 'Assignment') {
      title = `Practice Assignment 3: System Design and Architectures`;
      description = `Submit complete implementation block diagram, data schemas, and github source codes links.`;
      actionRequired = `Submit PDF report directly on LMS assignment portal link.`;
      priority = 'HIGH';
    } else if (category === 'Club Activity') {
      title = `Robotics and Coding Clubs Member Inductions`;
      description = `Recruiting core group and junior coordinators for technical clubs. Participate in mini challenge rounds.`;
      actionRequired = `Register for club recruitment form and attend offline briefing.`;
      priority = 'LOW';
    } else {
      title = `Important General Notice: Library Working Hours Extended`;
      description = `Library reading rooms will remain open until 08:30 PM everyday for semester exam preparations.`;
      actionRequired = `Use library card scanner for late entries. Maintain discipline.`;
      priority = 'LOW';
    }

    announcements.push({
      id: `ann-seeded-${100 + i}`,
      title,
      category,
      priority,
      description,
      date: eventDateStr,
      time: getRandomElement(['09:00 AM', '10:30 AM', '01:30 PM', '04:15 PM']),
      venue,
      eligibility: {
        departments: departmentCriteria,
        years: yearsCriteria,
        minCgpa,
        skills: requiredSkills,
        interests: requiredInterests
      },
      deadline: deadlineStr,
      actionRequired,
      summary: `Important update regarding ${category} on NEC campus.`,
      keywords: [category, ...departmentCriteria, ...requiredSkills]
    });
  }
  return announcements;
}

async function run() {
  try {
    console.log('Generating seed data...');
    const students = generateStudents();
    const announcements = generateAnnouncements();
    const placementPipelines = [
      { companyName: "Accenture", status: "Preparing", dateApplied: "2026-06-12" },
      { companyName: "Cognizant", status: "Applied", dateApplied: "2026-06-14" },
      { companyName: "Zoho", status: "Shortlisted", dateApplied: "2026-06-15" }
    ];

    const data = {
      profiles: students,
      announcements: announcements,
      placementPipelines: placementPipelines
    };

    console.log(`Generated:
- ${students.length} Student Profiles
- ${announcements.length} Campus Announcements / Items
- ${placementPipelines.length} Sample Pipelines`);

    await seedDatabase(data);

    console.log('✓ Seeding complete!');
    
    // Close Mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Fatal error seeding database:', err);
    process.exit(1);
  }
}

run();
