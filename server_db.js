import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

// MONGODB CONNECTION
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusassist';
let isMongoConnected = false;

async function connectMongo() {
  try {
    // Timeout in 3 seconds to trigger fallback quickly if MongoDB is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log('✓ Successfully connected to MongoDB at:', mongoURI);
    await initializeDefaultUsers();
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to server-side JSON storage.');
    isMongoConnected = false;
    await initializeDefaultUsers();
  }
}
connectMongo();

async function initializeDefaultUsers() {
  try {
    let count = 0;
    if (isMongoConnected) {
      count = await User.countDocuments({});
    } else {
      const db = await readJsonDb();
      count = (db.users || []).length;
    }
    
    if (count === 0) {
      console.log('Seeding default users (arun/studentpassword, srinivasan/facultypassword, admin/adminpassword)...');
      const studentPassword = await bcrypt.hash('studentpassword', 10);
      const facultyPassword = await bcrypt.hash('facultypassword', 10);
      const adminPassword = await bcrypt.hash('adminpassword', 10);
      
      const defaultUsers = [
        { username: 'arun', password: studentPassword, role: 'student' },
        { username: 'srinivasan', password: facultyPassword, role: 'faculty' },
        { username: 'admin', password: adminPassword, role: 'admin' }
      ];
      
      if (isMongoConnected) {
        await User.insertMany(defaultUsers);
      } else {
        const db = await readJsonDb();
        db.users = defaultUsers;
        await writeJsonDb(db);
      }
      console.log('✓ Default users initialized.');
    }
  } catch (err) {
    console.error('Failed to initialize default users:', err);
  }
}

export async function findUserByUsername(username) {
  if (isMongoConnected) {
    return await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
  } else {
    const db = await readJsonDb();
    return (db.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
  }
}

export async function registerUser(userData) {
  if (isMongoConnected) {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  } else {
    const db = await readJsonDb();
    db.users = db.users || [];
    db.users.push(userData);
    await writeJsonDb(db);
    return userData;
  }
}

// SCHEMAS

// 1. User
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true }
});
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 2. Student
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registerNumber: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  skills: [String],
  interests: [String],
  bookmarkedCategories: [String],
  previousSearches: [String]
});
export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

// 3. Announcement (Processed)
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  description: { type: String, required: true },
  date: String,
  time: String,
  venue: String,
  eligibility: {
    departments: [String],
    years: [Number],
    minCgpa: Number,
    skills: [String],
    interests: [String]
  },
  deadline: { type: String, required: true },
  actionRequired: { type: String, required: true },
  summary: String,
  keywords: [String]
});
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

// 4. Raw Announcement
const RawAnnouncementSchema = new mongoose.Schema({
  source: { type: String, required: true }, // 'faculty', 'email', 'lms', 'csv'
  rawText: { type: String, required: true },
  importedAt: { type: Date, default: Date.now },
  processedStatus: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' }
});
export const RawAnnouncement = mongoose.models.RawAnnouncement || mongoose.model('RawAnnouncement', RawAnnouncementSchema);

// 5. Placement Drive
const PlacementSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  cgpaCriteria: Number,
  deptCriteria: [String],
  deadline: String
});
export const Placement = mongoose.models.Placement || mongoose.model('Placement', PlacementSchema);

// 6. Internship
const InternshipSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  duration: String,
  stipend: String,
  deadline: String
});
export const Internship = mongoose.models.Internship || mongoose.model('Internship', InternshipSchema);

// 7. Scholarship
const ScholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: String,
  amount: String,
  deadline: String
});
export const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);

// 8. Event
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  venue: String,
  date: String,
  time: String
});
export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

// 9. Notifications
const NotificationSchema = new mongoose.Schema({
  userId: String,
  studentName: String,
  title: String,
  body: String,
  type: { type: String, enum: ['in-app', 'email', 'push'] },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  deadline: String
});
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// 10. Placement Participation (Roadmap Tracking)
const PipelineSchema = new mongoose.Schema({
  companyName: String,
  status: String,
  dateApplied: String
});
export const Pipeline = mongoose.models.Pipeline || mongoose.model('Pipeline', PipelineSchema);


// FALLBACK FILE-BASED CRUD UTILITIES
const INITIAL_JSON_STATE = {
  profiles: [],
  announcements: [],
  placementPipelines: [],
  rawAnnouncements: [],
  notifications: [],
  users: []
};

async function readJsonDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      await writeJsonDb(INITIAL_JSON_STATE);
      return INITIAL_JSON_STATE;
    }
    const data = await fs.promises.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.users) {
      parsed.users = [];
    }
    return parsed;
  } catch (err) {
    return INITIAL_JSON_STATE;
  }
}

async function writeJsonDb(data) {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing json db:', err);
  }
}

// UNIFIED CRUD INTERFACE (MongoDB + JSON fallback)

export async function getAnnouncements() {
  if (isMongoConnected) {
    return await Announcement.find({}).sort({ _id: -1 });
  } else {
    const db = await readJsonDb();
    return db.announcements || [];
  }
}

export async function addAnnouncement(annData) {
  if (isMongoConnected) {
    const newAnn = new Announcement(annData);
    await newAnn.save();
    return await getAnnouncements();
  } else {
    const db = await readJsonDb();
    db.announcements = [annData, ...(db.announcements || [])];
    await writeJsonDb(db);
    return db.announcements;
  }
}

export async function deleteAnnouncement(id) {
  if (isMongoConnected) {
    await Announcement.findByIdAndDelete(id);
    return await getAnnouncements();
  } else {
    const db = await readJsonDb();
    db.announcements = db.announcements.filter(a => a.id !== id && a._id !== id);
    await writeJsonDb(db);
    return db.announcements;
  }
}

export async function updateAnnouncement(id, annData) {
  if (isMongoConnected) {
    await Announcement.findByIdAndUpdate(id, annData);
    return await getAnnouncements();
  } else {
    const db = await readJsonDb();
    db.announcements = db.announcements.map(a => (a.id === id || a._id === id ? { ...a, ...annData } : a));
    await writeJsonDb(db);
    return db.announcements;
  }
}

export async function addRawAnnouncement(rawText, source) {
  if (isMongoConnected) {
    const newRaw = new RawAnnouncement({ source, rawText, processedStatus: 'pending' });
    return await newRaw.save();
  } else {
    const db = await readJsonDb();
    const newRaw = { id: `raw-${Date.now()}`, source, rawText, importedAt: new Date().toISOString(), processedStatus: 'pending' };
    db.rawAnnouncements = [newRaw, ...(db.rawAnnouncements || [])];
    await writeJsonDb(db);
    return newRaw;
  }
}

export async function getRawAnnouncements() {
  if (isMongoConnected) {
    return await RawAnnouncement.find({}).sort({ importedAt: -1 });
  } else {
    const db = await readJsonDb();
    return db.rawAnnouncements || [];
  }
}


export async function getProfiles() {
  if (isMongoConnected) {
    return await Student.find({});
  } else {
    const db = await readJsonDb();
    return db.profiles || [];
  }
}

export async function updateProfile(profileData) {
  if (isMongoConnected) {
    await Student.findOneAndUpdate(
      { name: profileData.name },
      profileData,
      { upsert: true, new: true }
    );
    return await getProfiles();
  } else {
    const db = await readJsonDb();
    const index = db.profiles.findIndex(p => p.name.toLowerCase() === profileData.name.toLowerCase());
    if (index !== -1) {
      db.profiles[index] = profileData;
    } else {
      db.profiles.push(profileData);
    }
    await writeJsonDb(db);
    return db.profiles;
  }
}

export async function getPipelines() {
  if (isMongoConnected) {
    return await Pipeline.find({});
  } else {
    const db = await readJsonDb();
    return db.placementPipelines || [];
  }
}

export async function savePipelines(pipelines) {
  if (isMongoConnected) {
    await Pipeline.deleteMany({});
    await Pipeline.insertMany(pipelines);
    return await getPipelines();
  } else {
    const db = await readJsonDb();
    db.placementPipelines = pipelines;
    await writeJsonDb(db);
    return db.placementPipelines;
  }
}

export async function getNotifications() {
  if (isMongoConnected) {
    return await Notification.find({}).sort({ createdAt: -1 });
  } else {
    const db = await readJsonDb();
    return db.notifications || [];
  }
}

export async function addNotification(notif) {
  if (isMongoConnected) {
    const newNotif = new Notification(notif);
    await newNotif.save();
    return await getNotifications();
  } else {
    const db = await readJsonDb();
    const newNotif = { id: `notif-${Date.now()}`, ...notif, createdAt: new Date().toISOString(), read: false };
    db.notifications = [newNotif, ...(db.notifications || [])];
    await writeJsonDb(db);
    return db.notifications;
  }
}

export async function clearNotifications() {
  if (isMongoConnected) {
    await Notification.deleteMany({});
    return [];
  } else {
    const db = await readJsonDb();
    db.notifications = [];
    await writeJsonDb(db);
    return [];
  }
}

export async function seedDatabase(data) {
  if (isMongoConnected) {
    await mongoose.connection.db.dropDatabase();
    
    // Seed Students
    await Student.insertMany(data.profiles);
    // Seed Announcements
    await Announcement.insertMany(data.announcements);
    // Seed Pipelines
    await Pipeline.insertMany(data.placementPipelines);
    // Seed Users
    if (data.users) {
      await User.insertMany(data.users);
    }
    
    // Seed extra collections
    if (data.placements) await Placement.insertMany(data.placements);
    if (data.internships) await Internship.insertMany(data.internships);
    if (data.scholarships) await Scholarship.insertMany(data.scholarships);
    if (data.events) await Event.insertMany(data.events);

    console.log('✓ MongoDB database fully seeded.');
  } else {
    const db = {
      profiles: data.profiles,
      announcements: data.announcements,
      placementPipelines: data.placementPipelines,
      users: data.users || [],
      placements: data.placements || [],
      internships: data.internships || [],
      scholarships: data.scholarships || [],
      events: data.events || [],
      notifications: [],
      rawAnnouncements: []
    };
    await writeJsonDb(db);
    console.log('✓ Local JSON database fully seeded.');
  }
}
