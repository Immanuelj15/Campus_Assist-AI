import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
  'Arun', 'Priya', 'Rahul', 'Keerthana', 'Siddharth', 'Divya', 'Vijay',
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
  return [];
}

async function run() {
  try {
    console.log('Generating seed data...');
    const students = generateStudents();
    const announcements = generateAnnouncements();
    const placementPipelines = [];

    const studentPassword = await bcrypt.hash('studentpassword', 10);
    const facultyPassword = await bcrypt.hash('facultypassword', 10);
    const adminPassword = await bcrypt.hash('adminpassword', 10);

    const users = [
      { username: 'arun', password: studentPassword, role: 'student' },
      { username: 'srinivasan', password: facultyPassword, role: 'faculty' },
      { username: 'admin', password: adminPassword, role: 'admin' }
    ];

    const data = {
      profiles: students,
      announcements: announcements,
      placementPipelines: placementPipelines,
      users: users
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
