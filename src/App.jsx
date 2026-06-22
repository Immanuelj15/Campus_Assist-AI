import React, { useState, useEffect } from 'react';
import { DEFAULT_STUDENT_PROFILE, CATEGORIES } from './data';
import StudentProfileCard from './components/StudentProfileCard';
import RemindersList from './components/RemindersList';
import AnnouncementCard from './components/AnnouncementCard';
import CampusChat from './components/CampusChat';
import DeadlineExtractor from './components/DeadlineExtractor';
import AnalyticsPanel from './components/AnalyticsPanel';
import KanbanTracker from './components/KanbanTracker';
import { 
  Sparkles, 
  Search, 
  Bot, 
  Cpu, 
  TrendingUp, 
  PlusCircle, 
  BookOpen, 
  Filter, 
  X,
  Bell,
  Moon,
  Sun,
  Upload,
  Database,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  Bookmark,
  Calendar,
  AlertTriangle,
  Mail,
  CloudLightning,
  Trash2,
  Lock,
  ChevronRight,
  User,
  Key,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_STUDENT_PROFILE);
  const [announcements, setAnnouncements] = useState([]);
  const [placementPipelines, setPlacementPipelines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rawAnnouncements, setRawAnnouncements] = useState([]);
  
  // Role & Theme & Token states
  const [token, setToken] = useState(() => localStorage.getItem('nec_auth_token') || '');
  const [role, setRole] = useState(() => localStorage.getItem('nec_auth_role') || 'student');
  const [username, setUsername] = useState(() => localStorage.getItem('nec_auth_username') || '');
  const [darkMode, setDarkMode] = useState(false);

  // Login Form States
  const [loginTab, setLoginTab] = useState('student'); // 'student', 'faculty', 'admin'
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAdminKey, setLoginAdminKey] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  
  // Notifications drawer state
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Session UI states (bookmarks, completed)
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('nec_viewed_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedIds, setCompletedIds] = useState(() => {
    const saved = localStorage.getItem('nec_completed_actions');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem('nec_bookmarked_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // activeTab changes based on the role
  const [activeTab, setActiveTab] = useState('opportunities');

  // Sync tab when role changes
  useEffect(() => {
    if (role === 'student') {
      setActiveTab('opportunities');
    } else if (role === 'faculty') {
      setActiveTab('manual-publish');
    } else if (role === 'admin') {
      setActiveTab('analytics');
    }
  }, [role]);

  // Load theme preference on mount
  useEffect(() => {
  }, []);

  // Force Light (White) Theme globally
  useEffect(() => {
    const body = document.body;
    body.classList.remove('dark');
    body.style.backgroundColor = '#f8fafc';
  }, []);

  // Fetch profiles, announcements, pipelines, raw logs, notifications on mount
  const fetchAllData = () => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch profiles
    fetch('/api/profiles', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfiles(data);
        const savedName = localStorage.getItem('nec_selected_profile_name');
        const active = data.find(p => p.name === savedName) || data[0];
        if (active) setProfile(active);
      })
      .catch(err => console.error('Failed to load profiles:', err));

    // Fetch announcements
    fetch('/api/announcements', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAnnouncements(data);
      })
      .catch(err => console.error('Failed to load announcements:', err));

    // Fetch pipelines
    fetch('/api/pipelines', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPlacementPipelines(data);
      })
      .catch(err => console.error('Failed to load pipelines:', err));

    // Fetch raw announcements (ingestion logs)
    fetch('/api/raw-announcements', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setRawAnnouncements(data);
      })
      .catch(err => console.error('Failed to load raw announcements:', err));

    // Fetch system notifications
    fetch('/api/notifications', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setNotifications(data);
      })
      .catch(err => console.error('Failed to load notifications:', err));
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  // Sync session UI state modifications to localStorage
  useEffect(() => {
    localStorage.setItem('nec_viewed_announcements', JSON.stringify(viewedIds));
  }, [viewedIds]);

  useEffect(() => {
    localStorage.setItem('nec_completed_actions', JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem('nec_bookmarked_announcements', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Manual Notice Entry Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('General Notice');
  const [newPriority, setNewPriority] = useState('LOW');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newDeptCriteria, setNewDeptCriteria] = useState('');
  const [newMinCgpa, setNewMinCgpa] = useState('');

  // Ingestion upload status states
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [csvFile, setCsvFile] = useState(null);
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [csvError, setCsvError] = useState(null);

  // Admin controls status
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Scoring engine utility (+30 Dept, +20 Year, +20 CGPA, +20 Skills, +10 Interest)
  const getScore = (p, ann) => {
    let score = 0;
    
    const depts = ann.eligibility?.departments || [];
    if (depts.length === 0 || depts.includes(p.department)) {
      score += 30;
    }

    const years = ann.eligibility?.years || [];
    if (years.length === 0 || years.includes(p.year)) {
      score += 20;
    }

    const minCgpa = ann.eligibility?.minCgpa || 0;
    if (p.cgpa >= minCgpa) {
      score += 20;
    }

    const skills = ann.eligibility?.skills || [];
    const hasSkillMatch = skills.some(s => 
      p.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
    );
    if (hasSkillMatch) {
      score += 20;
    }

    const interests = ann.eligibility?.interests || [];
    const hasInterestMatch = interests.some(i => 
      p.interests.some(pi => pi.toLowerCase() === i.toLowerCase())
    );
    if (hasInterestMatch) {
      score += 10;
    }

    return score;
  };

  // Process sorting & filters on announcements list
  const processedAnnouncements = announcements
    .map(ann => ({ ...ann, score: getScore(profile, ann) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const priorities = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorities[b.priority] - priorities[a.priority];
    })
    .filter(ann => {
      if (selectedCategory !== 'All' && ann.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && ann.priority !== selectedPriority) return false;
      if (onlyMatched && ann.score < 50) return false;
      if (onlyBookmarked && !bookmarkedIds.includes(ann.id)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          ann.title.toLowerCase().includes(query) ||
          ann.description.toLowerCase().includes(query) ||
          ann.category.toLowerCase().includes(query) ||
          ann.actionRequired.toLowerCase().includes(query)
        );
      }
      return true;
    });

  // Action methods
  const handleMarkViewed = (id) => {
    if (!viewedIds.includes(id)) {
      setViewedIds((prev) => [...prev, id]);
    }
  };

  const handleToggleCompleted = (id) => {
    if (completedIds.includes(id)) {
      setCompletedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setCompletedIds((prev) => [...prev, id]);
      handleMarkViewed(id);
    }
  };

  const handleToggleBookmark = (id) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setBookmarkedIds((prev) => [...prev, id]);
    }
  };

  const handleAddExtractedAnnouncement = (ann) => {
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ann)
    })
    .then(res => res.json())
    .then(data => {
      if (data.announcements) {
        setAnnouncements(data.announcements);
        fetchAllData();
      }
    })
    .catch(err => console.error('Failed to save extracted announcement:', err));

    setActiveTab('opportunities');
  };

  const handleAddPipeline = (item) => {
    const updated = [item, ...placementPipelines.filter(x => x.companyName.toLowerCase() !== item.companyName.toLowerCase())];
    setPlacementPipelines(updated);
    fetch('/api/pipelines', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to save pipelines:', err));
  };

  const handleRemovePipeline = (company) => {
    const updated = placementPipelines.filter(x => x.companyName !== company);
    setPlacementPipelines(updated);
    fetch('/api/pipelines', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to save pipelines:', err));
  };

  const handleUpdatePipelineStatus = (company, newStatus) => {
    const updated = placementPipelines.map(x => 
      x.companyName === company ? { ...x, status: newStatus } : x
    );
    setPlacementPipelines(updated);
    fetch('/api/pipelines', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to update pipeline status:', err));
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('nec_selected_profile_name', updatedProfile.name);
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedProfile)
    })
    .then(res => res.json())
    .then(() => {
      fetch('/api/profiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(pData => setProfiles(pData));
    })
    .catch(err => console.error('Failed to save profile:', err));
  };

  const handleManualNoticeSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDeadline) return;

    const parsedDepts = newDeptCriteria.trim() 
      ? newDeptCriteria.split(',').map(x => x.trim().toUpperCase()).filter(Boolean)
      : [];

    const newAnn = {
      title: newTitle.trim(),
      category: newCat,
      priority: newPriority,
      description: newDesc.trim() || 'No explicit description provided.',
      date: newDate || undefined,
      time: newTime || undefined,
      venue: newVenue || 'NEC Campus',
      eligibility: {
        departments: parsedDepts.length ? parsedDepts : undefined,
        minCgpa: newMinCgpa ? parseFloat(newMinCgpa) : undefined,
        years: [3, 4] // default to final/pre-final years
      },
      deadline: newDeadline,
      actionRequired: newAction.trim() || 'Register/apply on college LMS portal.'
    };

    fetch('/api/announcements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newAnn)
    })
    .then(res => res.json())
    .then(data => {
      if (data.announcements) {
        setAnnouncements(data.announcements);
        fetchAllData();
      }
    })
    .catch(err => console.error('Failed to post announcement:', err));

    // Clear form fields
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewTime('');
    setNewVenue('');
    setNewDeadline('');
    setNewAction('');
    setNewDeptCriteria('');
    setNewMinCgpa('');

    alert('Notice published manually and alerts sent to eligible student feeds!');
    setActiveTab('opportunities');
  };

  // Multer Ingestion API Upload handler
  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('attachment', uploadFile);

    try {
      const res = await fetch('/api/faculty/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status code ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setUploadSuccess(true);
      setUploadFile(null);
      setAnnouncements(data.announcements || []);
      fetchAllData();
      alert(`Successfully uploaded & ingested notice: "${data.announcement?.title}"`);
      setActiveTab('opportunities');
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to ingest file via Faculty attachment api.');
    } finally {
      setIsUploading(false);
    }
  };

  // CSV/Excel import handler
  const handleCsvUploadSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsCsvUploading(true);
    setCsvError(null);
    setCsvSuccess(false);

    const formData = new FormData();
    formData.append('csvFile', csvFile);

    try {
      const res = await fetch('/api/faculty/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status code ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setCsvSuccess(true);
      setCsvFile(null);
      setAnnouncements(data.announcements || []);
      fetchAllData();
      alert(`CSV Roster Imported successfully! Added ${data.count} new notice items to database.`);
      setActiveTab('opportunities');
    } catch (err) {
      console.error(err);
      setCsvError(err.message || 'Failed to import CSV roster sheets.');
    } finally {
      setIsCsvUploading(false);
    }
  };

  // Admin sync handlers
  const handleTriggerLmsSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Polling Moodle LMS Canvas boards notifications...');
    try {
      const res = await fetch('/api/lms/sync');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncStatus(`LMS Sync Completed! Pulled: "${data.announcement?.title}"`);
      setAnnouncements(data.announcements || []);
      fetchAllData();
    } catch (err) {
      setSyncStatus(`LMS Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerEmailSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Reading unread emails from college mail inbox logs...');
    try {
      const res = await fetch('/api/emails/sync');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncStatus(`Email Sync Ingestion Successful! Pulled notice: "${data.announcement?.title}"`);
      setAnnouncements(data.announcements || []);
      fetchAllData();
    } catch (err) {
      setSyncStatus(`Email sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerNotificationEngine = async () => {
    setIsSyncing(true);
    setSyncStatus('Running smart notification deadline scheduler...');
    try {
      const res = await fetch('/api/notifications/reminders');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncStatus(`Notification Engine Triggered! Generated ${data.remindersSent} new deadline push alerts.`);
      setNotifications(data.notifications || []);
      fetchAllData();
    } catch (err) {
      setSyncStatus(`Notification engine trigger failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearNotifications = async () => {
    if (!window.confirm('Delete all notifications from database log?')) return;
    try {
      const res = await fetch('/api/notifications', { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data || []);
      alert('Notifications log cleared.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all databases, clear custom uploads, and reseed mock dataset back to factory defaults?')) {
      fetch('/api/reset', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(() => {
        localStorage.clear();
        alert('Database cleared and seeded with fresh data!');
        window.location.reload();
      })
      .catch(err => console.error('Failed to reset backend database:', err));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (loginPassword !== signUpConfirmPassword) {
      setLoginError('Passwords do not match');
      return;
    }
    setLoginLoading(true);
    try {
      const payload = {
        username: loginUsername,
        password: loginPassword,
        role: loginTab,
      };
      if (loginTab === 'admin') {
        payload.adminKey = loginAdminKey;
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      localStorage.setItem('nec_auth_token', data.token);
      localStorage.setItem('nec_auth_role', data.role);
      localStorage.setItem('nec_auth_username', data.username);
      setToken(data.token);
      setRole(data.role);
      setUsername(data.username);
      setLoginUsername('');
      setLoginPassword('');
      setSignUpConfirmPassword('');
      setLoginAdminKey('');
      setIsSignUp(false);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const payload = {
        username: loginUsername,
        password: loginPassword,
        role: loginTab,
      };
      if (loginTab === 'admin') {
        payload.adminKey = loginAdminKey;
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      localStorage.setItem('nec_auth_token', data.token);
      localStorage.setItem('nec_auth_role', data.role);
      localStorage.setItem('nec_auth_username', data.username);
      setToken(data.token);
      setRole(data.role);
      setUsername(data.username);
      setLoginUsername('');
      setLoginPassword('');
      setLoginAdminKey('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nec_auth_token');
    localStorage.removeItem('nec_auth_role');
    localStorage.removeItem('nec_auth_username');
    setToken('');
    setRole('student');
    setUsername('');
    setProfiles([]);
    setAnnouncements([]);
    setPlacementPipelines([]);
    setRawAnnouncements([]);
    setNotifications([]);
  };

  // Notification badge calculation
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white animated-gradient-light text-slate-800">
        <div className="w-full max-w-md">
          {/* Logo / Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white font-sans font-black text-3xl shadow-xl shadow-indigo-200/50 border border-indigo-400/20 mb-3 neon-glow">
              N
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase font-display">
              CampusAssist AI
            </h1>
            <p className="text-xs text-indigo-700 font-extrabold uppercase tracking-widest mt-1.5">
              National Engineering College
            </p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
              Secure Role-Based Portal
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-indigo-100/40 transition-all duration-300">
            <h2 className="text-slate-800 text-lg font-extrabold mb-4 text-center uppercase tracking-tight">
              {isSignUp ? 'Create a New Account' : 'Sign In to your Account'}
            </h2>

            {/* Tabs for Roles */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6">
              {['student', 'faculty', 'admin'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setLoginTab(tab);
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    loginTab === tab
                      ? 'bg-white text-indigo-600 shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 text-left flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Animated Form container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup-form' : 'signin-form'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <form 
                  onSubmit={isSignUp ? handleRegister : handleLogin} 
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                        placeholder={`Choose ${loginTab} username`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock size={15} />
                        </div>
                        <input
                          type="password"
                          required
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  )}

                  {loginTab === 'admin' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        Admin Security Key
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Key size={15} />
                        </div>
                        <input
                          type="password"
                          required
                          value={loginAdminKey}
                          onChange={(e) => setLoginAdminKey(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                          placeholder="Enter admin security key"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-700/45 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        {isSignUp ? 'Registering...' : 'Authenticating...'}
                      </>
                    ) : (
                      <>
                        {isSignUp ? 'Sign Up & Login' : 'Sign In'}
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>

            {/* Toggle Sign In / Sign Up option */}
            <div className="mt-5 border-t border-slate-150 pt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLoginError('');
                  setLoginUsername('');
                  setLoginPassword('');
                  setSignUpConfirmPassword('');
                  setLoginAdminKey('');
                }}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </div>

          {/* Credentials Helper Card (Only visible in Login mode for developer testing) */}
          {!isSignUp && (
            <div className="mt-6 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm text-left">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-3 flex items-center gap-1.5">
                <Key size={12} className="text-indigo-600" />
                Demo Credentials (Testing)
              </h4>
              <div className="space-y-2 text-[11px] font-semibold text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span>Student: <code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-indigo-700 font-mono text-[10px]">arun</code></span>
                  <span>Pass: <code className="font-mono text-slate-800 text-[10px]">studentpassword</code></span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 py-1.5">
                  <span>Faculty: <code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-violet-700 font-mono text-[10px]">srinivasan</code></span>
                  <span>Pass: <code className="font-mono text-slate-800 text-[10px]">facultypassword</code></span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span>Admin: <code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-mono text-[10px]">admin</code></span>
                  <span>Pass: <code className="font-mono text-slate-800 text-[10px]">adminpassword</code></span>
                </div>
                {loginTab === 'admin' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-105 text-[10px] text-slate-900 font-bold">
                    Admin Key: <code className="bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg font-mono text-[10px] text-indigo-850">nec_admin_secret_2026</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="main-container" className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased transition-colors duration-300 bg-slate-50/50 text-slate-800">
      
      {/* College App Header Branding */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-sans font-black text-xl shadow-lg border border-indigo-400">
              N
            </div>
            <div className="text-left">
              <h1 className="font-sans font-black text-xl tracking-tighter text-slate-900 dark:text-white flex items-center gap-2 uppercase">
                CampusAssist AI
                <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 uppercase tracking-widest leading-none">
                  NEC PORTAL
                </span>
              </h1>
              <p className="text-[10px] text-slate-550 dark:text-slate-500 font-bold uppercase tracking-wider">National Engineering College • Intelligent Assist Platform</p>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500">Authenticated user:</span>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none mt-0.5">{username} ({role})</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 px-3.5 py-1.5 border border-rose-250 dark:border-rose-900/80 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Quick Actions (Notification alerts bell) */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              title="Notifications Drawer"
            >
              <Bell size={15} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              onClick={handleResetData}
              className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              Reset DB
            </button>
          </div>
        </div>
      </header>

      {/* Main layout contents */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Side Profile & Status Panel (Span 4 columns) */}
        <section className="lg:col-span-4 space-y-6">
          {role === 'student' && (
            <>
              <StudentProfileCard 
                profile={profile} 
                profiles={profiles} 
                onChange={handleUpdateProfile} 
                onSelectProfile={(pName) => {
                  const selected = profiles.find(p => p.name === pName);
                  if (selected) handleUpdateProfile(selected);
                }} 
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 text-left transition-all duration-300">
                <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Student Workspace</span>
                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'opportunities', label: 'Opportunities Feed', icon: BookOpen },
                    { id: 'advisor', label: 'AI Advisor Chat', icon: Bot },
                    { id: 'kanban', label: 'Application Tracker', icon: TrendingUp }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full px-4 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-between cursor-pointer uppercase tracking-widest ${
                          activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {tab.label}
                        </span>
                        <ChevronRight size={12} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              <RemindersList announcements={announcements} completedActions={completedIds} />
            </>
          )}

          {role === 'faculty' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5 text-left transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  FS
                </div>
                <div>
                  <h3 className="font-sans font-black text-slate-900 dark:text-white text-base leading-tight uppercase">Faculty Portal</h3>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase">Prof. Srinivasan • CSE</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Workspace tools</span>
                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'manual-publish', label: 'Publish Manual Notice', icon: PlusCircle },
                    { id: 'extractor', label: 'AI notice extractor', icon: Cpu },
                    { id: 'import-csv', label: 'CSV/Excel roster import', icon: FileText },
                    { id: 'kanban', label: 'Application Kanban', icon: TrendingUp },
                    { id: 'ingestion-logs', label: 'notice Ingestion logs', icon: Clock }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full px-4 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-between cursor-pointer uppercase tracking-widest ${
                          activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-355 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {tab.label}
                        </span>
                        <ChevronRight size={12} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[9px] tracking-wider">Ingestion Feed Statistics</span>
                <p>✓ Active Board Items: <span className="font-bold text-indigo-500">{announcements.length}</span></p>
                <p>✓ Unprocessed Mail Snippets: <span className="font-bold text-rose-500">{rawAnnouncements.filter(r => r.processedStatus === 'pending').length}</span></p>
                <p>✓ Active Ingested Logs: <span className="font-bold text-slate-800 dark:text-slate-200">{rawAnnouncements.length}</span></p>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5 text-left transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 bg-indigo-600/80 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  AD
                </div>
                <div>
                  <h3 className="font-sans font-black text-slate-900 dark:text-white text-base leading-tight uppercase">Admin Desk</h3>
                  <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold tracking-widest uppercase">Platform Control Center</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Views</span>
                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'analytics', label: 'System Analytics & track', icon: TrendingUp },
                    { id: 'kanban', label: 'Corporate Funnels', icon: Briefcase },
                    { id: 'notifications-logs', label: 'Dispatched notifications', icon: Bell },
                    { id: 'system-syncs', label: 'Ingestion sync controls', icon: Database }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full px-4 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-between cursor-pointer uppercase tracking-widest ${
                          activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-355 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {tab.label}
                        </span>
                        <ChevronRight size={12} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[9px] tracking-wider">Sync Quick Actions</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleTriggerLmsSync} 
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-center hover:bg-slate-800 cursor-pointer"
                  >
                    LMS Sync
                  </button>
                  <button 
                    onClick={handleTriggerEmailSync} 
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-center hover:bg-slate-800 cursor-pointer"
                  >
                    Mail Sync
                  </button>
                </div>
                <button 
                  onClick={handleTriggerNotificationEngine}
                  className="w-full px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-center hover:bg-indigo-700 cursor-pointer"
                >
                  Trigger Deadline Alert engine
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Side Main Workspaces (Span 8 columns) */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* ============================================================== */}
            {/* STUDENT ROLES WORKSPACES */}
            {/* ============================================================== */}

            {/* TAB: Opportunities Feed */}
            {activeTab === 'opportunities' && role === 'student' && (
              <motion.div
                key="opportunities"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Hero design card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-indigo-950 neon-glow">
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="space-y-3 z-10 text-left">
                    <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter italic uppercase text-white">
                      HOW CAN I<br />HELP TODAY?
                    </h2>
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-wider max-w-sm">
                      Consult your AI advisor, check matched openings, and download calendar .ics invites.
                    </p>
                  </div>
                  <div className="flex gap-2.5 shrink-0 z-10 w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('advisor')}
                      className="flex-1 md:flex-none px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                    >
                      Ask Counselor
                    </button>
                  </div>
                </div>

                {/* Search & Actions toolbar filter */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
                  <div className="relative flex-1 w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search opportunities, branches, prerequisites, topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Multi Filters categories */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Filter size={13} />
                      <span>Category:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['All', ...CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer text-[10px] uppercase tracking-wide ${
                            selectedCategory === cat
                              ? 'bg-slate-900 dark:bg-indigo-600 border-slate-950 dark:border-indigo-700 text-white font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 justify-between pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Priority selector */}
                      <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                        <span>Priority:</span>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="All">All Priorities</option>
                          <option value="HIGH">High Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="LOW">Low Priority</option>
                        </select>
                      </div>

                      {/* Matching toggle */}
                      <label className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyMatched}
                          onChange={(e) => setOnlyMatched(e.target.checked)}
                          className="accent-indigo-600 h-3.5 w-3.5"
                        />
                        <span>Highly Matched Feed (Score &gt;= 50)</span>
                      </label>

                      {/* Bookmarks toggle */}
                      <label className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyBookmarked}
                          onChange={(e) => setOnlyBookmarked(e.target.checked)}
                          className="accent-indigo-600 h-3.5 w-3.5"
                        />
                        <span className="flex items-center gap-1">
                          <Bookmark size={11} className="fill-current text-indigo-500" />
                          Bookmarks Only
                        </span>
                      </label>
                    </div>

                    <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-500">
                      Found {processedAnnouncements.length} of {announcements.length} entries
                    </p>
                  </div>
                </div>

                {/* Main Opportunities Feed stack */}
                <div className="space-y-4">
                  {processedAnnouncements.map((ann, idx) => (
                    <AnnouncementCard
                      key={ann.id}
                      announcement={ann}
                      profile={profile}
                      isViewed={viewedIds.includes(ann.id)}
                      isCompleted={completedIds.includes(ann.id)}
                      isBookmarked={bookmarkedIds.includes(ann.id)}
                      onMarkViewed={() => handleMarkViewed(ann.id)}
                      onToggleComplete={() => handleToggleCompleted(ann.id)}
                      onToggleBookmark={() => handleToggleBookmark(ann.id)}
                      index={idx}
                      darkMode={darkMode}
                    />
                  ))}

                  {processedAnnouncements.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                      <p className="font-display font-bold text-slate-600 dark:text-slate-350 text-base">No Matching Notices Found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">Try resetting filters, searching for alternate keywords, or toggling bookmarked filters.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: Student Counselor Chatbot */}
            {activeTab === 'advisor' && role === 'student' && (
              <motion.div
                key="advisor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <CampusChat profile={profile} announcements={announcements} darkMode={darkMode} />
              </motion.div>
            )}

            {/* TAB: Student Career Kanban Tracker */}
            {activeTab === 'kanban' && role === 'student' && (
              <motion.div
                key="student-kanban"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <KanbanTracker 
                  placementPipelines={placementPipelines}
                  onAddPipeline={handleAddPipeline}
                  onRemovePipeline={handleRemovePipeline}
                  onUpdatePipelineStatus={handleUpdatePipelineStatus}
                />
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* FACULTY PORTAL WORKSPACES */}
            {/* ============================================================== */}

            {/* TAB: Faculty Manual Publish Form */}
            {activeTab === 'manual-publish' && role === 'faculty' && (
              <motion.div
                key="manual-publish"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter">Publish Notice Item</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Submit manual announcement inputs to college board database</p>
                  </div>
                </div>

                <form onSubmit={handleManualNoticeSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Notice/Event Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Zoho Corporation Hiring Drive 2026"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Notice Category</label>
                      <select
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Default Priority Level</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Detailed Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Provide full details of the notice, guidelines, eligibility instructions..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Event Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Venue</label>
                      <input
                        type="text"
                        value={newVenue}
                        onChange={(e) => setNewVenue(e.target.value)}
                        placeholder="e.g. IT Labs, Auditorium"
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Deadline Date *</label>
                      <input
                        type="date"
                        required
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        className="w-full px-2 py-2 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Departments (comma-separated)</label>
                      <input
                        type="text"
                        value={newDeptCriteria}
                        onChange={(e) => setNewDeptCriteria(e.target.value)}
                        placeholder="e.g. CSE, IT, AI&DS"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Min CGPA Required</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMinCgpa}
                        onChange={(e) => setNewMinCgpa(e.target.value)}
                        placeholder="e.g. 7.5"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Action Required *</label>
                    <input
                      type="text"
                      required
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      placeholder="e.g. Apply on Zoho hiring link and upload verified CV."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl text-center shadow-md transition-all cursor-pointer"
                  >
                    Publish Board Notice
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB: Faculty AI Notice Extractor (Multer Ingestion File Upload) */}
            {activeTab === 'extractor' && role === 'faculty' && (
              <motion.div
                key="extractor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Text Ingestion extractor */}
                <DeadlineExtractor onAddExtractedAnnouncement={handleAddExtractedAnnouncement} />

                {/* PDF/DOCX Document Multer Upload */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                      <Upload size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-slate-900 dark:text-white text-base uppercase tracking-tighter">Ingest PDF/Image Flyer</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Upload flyer files, run raw parsing, and ingest to DB via Groq AI</p>
                    </div>
                  </div>

                  <form onSubmit={handleFileUploadSubmit} className="space-y-4 pt-2">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/20">
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.xlsx"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-2">
                        <Upload className="mx-auto text-slate-400 dark:text-slate-600" size={32} />
                        {uploadFile ? (
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Selected: {uploadFile.name}</p>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag flyer documents here or click to browse</p>
                            <p className="text-[10px] text-slate-400">Supports PDF, DOCX, Images (JPG, PNG) or Excel (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!uploadFile || isUploading}
                        className="px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
                        {isUploading ? 'Parsing Flyer with Groq...' : 'Upload & Process Notice'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB: Faculty CSV/Excel Roster Upload */}
            {activeTab === 'import-csv' && role === 'faculty' && (
              <motion.div
                key="import-csv"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-slate-900 dark:text-white text-base uppercase tracking-tighter">CSV/Excel Notice Ingestion</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Bulk import announcement rows directly from standard Excel sheets</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <p className="font-black text-slate-800 dark:text-slate-200 uppercase text-[9px] tracking-wider">Required Column Schema Headers:</p>
                  <p className="font-mono text-[10px] bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    Title | Category | Priority | Description | Venue | Deadline | Action
                  </p>
                  <p className="text-[10px]">Uploading a sheet automatically parses rows, maps variables, saves to processed databases, and dispatches in-app alerts to student dashboards.</p>
                </div>

                <form onSubmit={handleCsvUploadSubmit} className="space-y-4 pt-2">
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/20">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-2">
                      <Upload className="mx-auto text-slate-400 dark:text-slate-600" size={32} />
                      {csvFile ? (
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wide">Selected Sheet: {csvFile.name}</p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Spreadsheet (.xlsx, .csv) to upload</p>
                          <p className="text-[10px] text-slate-400">Imports schedule listings in bulk batches</p>
                        </>
                      )}
                    </div>
                  </div>

                  {csvError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                      <span>{csvError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!csvFile || isCsvUploading}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-sm border border-emerald-800"
                    >
                      {isCsvUploading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                      {isCsvUploading ? 'Processing spreadsheet...' : 'Start Ingestion Batch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB: Faculty Placement Kanban Tracker View */}
            {activeTab === 'kanban' && role === 'faculty' && (
              <motion.div
                key="faculty-kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl"
              >
                <KanbanTracker 
                  placementPipelines={placementPipelines}
                  onAddPipeline={handleAddPipeline}
                  onRemovePipeline={handleRemovePipeline}
                  onUpdatePipelineStatus={handleUpdatePipelineStatus}
                />
              </motion.div>
            )}

            {/* TAB: Notice Ingestion Logs */}
            {activeTab === 'ingestion-logs' && role === 'faculty' && (
              <motion.div
                key="ingestion-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-slate-900 dark:text-white text-base uppercase tracking-tighter">Notice Ingestion Logs</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Raw text log items collected by Email, LMS Canvas sync, and upload widgets</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchAllData}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600"
                    title="Reload Logs"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Raw Content Snippet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawAnnouncements.map((log) => {
                        let sourceBadge = 'bg-slate-100 text-slate-700';
                        if (log.source === 'email') sourceBadge = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900';
                        if (log.source === 'lms') sourceBadge = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
                        if (log.source === 'faculty') sourceBadge = 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900';

                        return (
                          <tr key={log.id || log._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <td className="py-3 px-3 font-mono text-[9px] text-slate-400 whitespace-nowrap">
                              {new Date(log.importedAt || Date.now()).toLocaleDateString()} {new Date(log.importedAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${sourceBadge}`}>
                                {log.source}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle size={10} />
                                Processed
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs font-mono text-[10px]">
                              {log.rawText}
                            </td>
                          </tr>
                        );
                      })}
                      {rawAnnouncements.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-[10px] font-bold uppercase text-slate-400">No notice ingestion pipeline activities found yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* ADMIN WORKSPACES */}
            {/* ============================================================== */}

            {/* TAB: Analytics & Placement Pipelines */}
            {activeTab === 'analytics' && role === 'admin' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <AnalyticsPanel 
                  announcements={announcements}
                  viewedIds={viewedIds}
                  completedIds={completedIds}
                  placementPipelines={placementPipelines}
                  onAddPipeline={handleAddPipeline}
                  onRemovePipeline={handleRemovePipeline}
                />
              </motion.div>
            )}

            {/* TAB: System Notifications Alert Logs */}
            {activeTab === 'notifications-logs' && role === 'admin' && (
              <motion.div
                key="notifications-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white text-xl">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-slate-900 dark:text-white text-base uppercase tracking-tighter">System Dispatched alerts log</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">In-App, Push & Email logs triggered for students based on deadlines</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearNotifications}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    <Trash2 size={11} />
                    Clear Alerts Log
                  </button>
                </div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {notifications.map((notif) => {
                    let typeBadge = 'bg-slate-100 text-slate-600';
                    if (notif.type === 'push') typeBadge = 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900';
                    if (notif.type === 'in-app') typeBadge = 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900';

                    return (
                      <div key={notif.id || notif._id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-semibold space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${typeBadge}`}>
                            {notif.type}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {new Date(notif.createdAt || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                        <h5 className="font-sans font-black uppercase text-slate-800 dark:text-white leading-tight text-xs pt-1">{notif.title}</h5>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px] leading-relaxed">{notif.body}</p>
                      </div>
                    );
                  })}

                  {notifications.length === 0 && (
                    <div className="text-center py-10 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-500">No alerts have been dispatched yet. Trigger the engine below or publish notices.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: Admin Placement Kanban Tracker View */}
            {activeTab === 'kanban' && role === 'admin' && (
              <motion.div
                key="admin-kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl"
              >
                <KanbanTracker 
                  placementPipelines={placementPipelines}
                  onAddPipeline={handleAddPipeline}
                  onRemovePipeline={handleRemovePipeline}
                  onUpdatePipelineStatus={handleUpdatePipelineStatus}
                />
              </motion.div>
            )}

            {/* TAB: Ingestion Sync Controls */}
            {activeTab === 'system-syncs' && role === 'admin' && (
              <motion.div
                key="system-syncs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left shadow-xl space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-slate-900 dark:text-white text-base uppercase tracking-tighter">System Pipeline Controls</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Sync external database nodes, mail logs, moodle syncs, and resets</p>
                  </div>
                </div>

                {syncStatus && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-start gap-2.5 text-indigo-700 dark:text-indigo-400 animate-pulse">
                    <Sparkles className="shrink-0 text-indigo-600" size={16} />
                    <div>
                      <span className="uppercase text-[9px] font-black block tracking-wider text-slate-500">Execution Console:</span>
                      <p className="mt-0.5">{syncStatus}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sync Card 1: LMS */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                        <CloudLightning size={14} />
                        Moodle Canvas LMS Sync
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Poll notices from Moodle Canvas discussion boards. Mock Sync downloads new assignment details and extracts deadline checklists.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerLmsSync}
                      disabled={isSyncing}
                      className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-800 cursor-pointer"
                    >
                      Trigger LMS Sync API
                    </button>
                  </div>

                  {/* Sync Card 2: Email */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                        <Mail size={14} />
                        Faculty Email Ingestion
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Query college SMTP/IMAP servers for notices from directors and placement coordinators. Runs classification using Groq.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerEmailSync}
                      disabled={isSyncing}
                      className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-800 cursor-pointer"
                    >
                      Trigger Email Ingestion
                    </button>
                  </div>

                  {/* Sync Card 3: Alert reminders */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                        <Bell size={14} />
                        Deadline alerts engine
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Calculate upcoming deadlines relative to current dates. Schedules emails and push notifications for items due within 1, 3, or 7 days.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerNotificationEngine}
                      disabled={isSyncing}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-indigo-750 cursor-pointer"
                    >
                      Trigger Alert Scheduler
                    </button>
                  </div>

                  {/* Sync Card 4: Database Reset */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest">
                        <Database size={14} />
                        Full Seeding Resets
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Drop all tables/collections, reset user configurations, delete local files cache, and re-seed 100 students + 100 notices.
                      </p>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-rose-700 cursor-pointer animate-pulse"
                    >
                      Reset & Re-seed Data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 National Engineering College • Powered by CampusAssist AI Counsel Suite</p>
          <div className="flex gap-4">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded bg-slate-950 text-indigo-400">
              MongoDB Fallback Client Active
            </span>
          </div>
        </div>
      </footer>

      {/* Sliding Side Notification Drawer */}
      <AnimatePresence>
        {showNotifDrawer && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Drawer Backdrop click handles */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowNotifDrawer(false)}></div>
            
            <motion.div
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-indigo-400" />
                  <span className="font-display font-black text-base uppercase tracking-tight">Active Deadline Alerts</span>
                </div>
                <button 
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                {notifications.map((notif) => {
                  let badgeStyle = 'bg-slate-100 text-slate-700';
                  if (notif.type === 'push') badgeStyle = 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900';
                  if (notif.type === 'in-app') badgeStyle = 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900';

                  return (
                    <div 
                      key={notif.id || notif._id} 
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${badgeStyle}`}>
                          {notif.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <h4 className="font-sans font-black text-slate-800 dark:text-white text-xs uppercase leading-tight pt-1">{notif.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-semibold">{notif.body}</p>
                      
                      {notif.deadline && (
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-tight">
                          TARGET DEADLINE: {notif.deadline}
                        </p>
                      )}
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="text-center py-20 text-slate-400 space-y-3">
                    <Bell className="mx-auto opacity-30" size={32} />
                    <p className="text-xs font-black uppercase tracking-wider">No alerts active</p>
                    <p className="text-[10px] max-w-xs mx-auto">Alerts will trigger automatically based on announcements deadlines, or when Sync engines are triggered.</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <button
                  onClick={handleClearNotifications}
                  disabled={notifications.length === 0}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800"
                >
                  Clear Alerts
                </button>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="flex-1 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
