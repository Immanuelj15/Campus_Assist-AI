import React, { useState, useEffect } from 'react';
import { DEFAULT_STUDENT_PROFILE, CATEGORIES } from './data';
import StudentProfileCard from './components/StudentProfileCard';
import RemindersList from './components/RemindersList';
import AnnouncementCard from './components/AnnouncementCard';
import CampusChat from './components/CampusChat';
import DeadlineExtractor from './components/DeadlineExtractor';
import AnalyticsPanel from './components/AnalyticsPanel';
import { 
  Sparkles, 
  Search, 
  Bot, 
  Cpu, 
  TrendingUp, 
  PlusCircle, 
  BookOpen, 
  Filter, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_STUDENT_PROFILE);
  const [announcements, setAnnouncements] = useState([]);
  const [placementPipelines, setPlacementPipelines] = useState([]);

  // Session-based read/completed UI states can remain in localStorage
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('nec_viewed_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedIds, setCompletedIds] = useState(() => {
    const saved = localStorage.getItem('nec_completed_actions');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch dynamic data from the server on mount
  useEffect(() => {
    // Fetch profiles
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
        const savedName = localStorage.getItem('nec_selected_profile_name');
        const active = data.find(p => p.name === savedName) || data[0];
        if (active) setProfile(active);
      })
      .catch(err => console.error('Failed to load profiles:', err));

    // Fetch announcements
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error('Failed to load announcements:', err));

    // Fetch pipelines
    fetch('/api/pipelines')
      .then(res => res.json())
      .then(data => setPlacementPipelines(data))
      .catch(err => console.error('Failed to load pipelines:', err));
  }, []);

  // Sync session UI state modifications to localStorage
  useEffect(() => {
    localStorage.setItem('nec_viewed_announcements', JSON.stringify(viewedIds));
  }, [viewedIds]);

  useEffect(() => {
    localStorage.setItem('nec_completed_actions', JSON.stringify(completedIds));
  }, [completedIds]);

  // View settings
  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Utility to count match scores dynamically
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

  const handleAddExtractedAnnouncement = (ann) => {
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ann)
    })
    .then(res => res.json())
    .then(data => {
      if (data.announcements) {
        setAnnouncements(data.announcements);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to save pipelines:', err));
  };

  const handleRemovePipeline = (company) => {
    const updated = placementPipelines.filter(x => x.companyName !== company);
    setPlacementPipelines(updated);
    fetch('/api/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to save pipelines:', err));
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('nec_selected_profile_name', updatedProfile.name);
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile)
    })
    .then(res => res.json())
    .then(() => {
      fetch('/api/profiles')
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
      id: `ann-manual-${Date.now()}`,
      title: newTitle.trim(),
      category: newCat,
      priority: newPriority,
      description: newDesc.trim() || 'No explicit description provided.',
      date: newDate || undefined,
      time: newTime || undefined,
      venue: newVenue || 'NEC Campus',
      eligibility: {
        departments: parsedDepts.length ? parsedDepts : undefined,
        minCgpa: newMinCgpa ? parseFloat(newMinCgpa) : undefined
      },
      deadline: newDeadline,
      actionRequired: newAction.trim() || 'Register/apply on LMS.'
    };

    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnn)
    })
    .then(res => res.json())
    .then(data => {
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    })
    .catch(err => console.error('Failed to post announcement:', err));

    setShowAddModal(false);

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
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all dashboard data, student profiles, and pipelines back to default?')) {
      fetch('/api/reset', {
        method: 'POST'
      })
      .then(res => res.json())
      .then(() => {
        localStorage.clear();
        window.location.reload();
      })
      .catch(err => console.error('Failed to reset backend database:', err));
    }
  };

  return (
    <div id="main-container" className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* College App Header Branding */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-sans font-black text-xl shadow-lg">
              N
            </div>
            <div className="text-left">
              <h1 className="font-sans font-black text-xl tracking-tighter text-slate-900 flex items-center gap-2 uppercase">
                CampusAssist AI
                <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-150 uppercase tracking-widest leading-none">
                  NEC PORTAL
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">National Engineering College • Intelligent Assist Platform</p>
            </div>
          </div>

          {/* Navigation Tab buttons bar */}
          <nav className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-4 py-2.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest ${
                activeTab === 'opportunities' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen size={13} />
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-4 py-2.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest ${
                activeTab === 'advisor' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bot size={13} />
              AI Counselor
            </button>
            <button
              onClick={() => setActiveTab('extractor')}
              className={`px-4 py-2.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest ${
                activeTab === 'extractor' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Cpu size={13} />
              AI Extractor
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest ${
                activeTab === 'analytics' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={13} />
              Analytics & Track
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Main layout contents */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Side Info Panel: Profile Summary + Warnings Board (Span 4 columns) */}
        <section className="lg:col-span-4 space-y-6">
          <StudentProfileCard 
            profile={profile} 
            profiles={profiles} 
            onChange={handleUpdateProfile} 
            onSelectProfile={(pName) => {
              const selected = profiles.find(p => p.name === pName);
              if (selected) handleUpdateProfile(selected);
            }} 
          />
          
          <RemindersList announcements={announcements} completedActions={completedIds} />
        </section>

        {/* Right Side Workspaces: Grid Panels based on Active Tab (Span 8 columns) */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: Opportunities Feed */}
            {activeTab === 'opportunities' && (
              <motion.div
                key="opportunities"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Hero design template box */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="space-y-3 z-10 text-left">
                    <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter italic uppercase text-white">
                      HOW CAN I<br />HELP TODAY?
                    </h2>
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-wider max-w-sm">
                      Ask about placements, deadlines, or check your personalized eligibility.
                    </p>
                  </div>
                  <div className="flex gap-2.5 shrink-0 z-10 w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('advisor')}
                      className="flex-1 md:flex-none px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                    >
                      Ask Counselor
                    </button>
                    <button
                      onClick={() => setActiveTab('extractor')}
                      className="flex-1 md:flex-none px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center border border-slate-700"
                    >
                      AI Extractor
                    </button>
                  </div>
                </div>

                {/* Search & Actions toolbar filter */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search opportunities, branches, prerequisites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case"
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full md:w-auto px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                    >
                      <PlusCircle size={14} />
                      Publish Manual Notice
                    </button>
                  </div>

                  {/* Multi Filters criteria */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Filter size={13} />
                      <span>Category:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['All', ...CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-slate-900 border-slate-950 text-white font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 justify-between pt-1 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                        <span>Priority Level:</span>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                        >
                          <option value="All">All Priorities</option>
                          <option value="HIGH">High Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="LOW">Low Priority</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-1.5 font-semibold text-slate-600 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyMatched}
                          onChange={(e) => setOnlyMatched(e.target.checked)}
                          className="accent-indigo-600 h-3.5 w-3.5"
                        />
                        <span>Highly Matched (Score &gt;= 50)</span>
                      </label>
                    </div>

                    <p className="text-[11px] font-mono font-bold text-slate-400">
                      Showing {processedAnnouncements.length} of {announcements.length} notices
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
                      onMarkViewed={() => handleMarkViewed(ann.id)}
                      onToggleComplete={() => handleToggleCompleted(ann.id)}
                      index={idx}
                    />
                  ))}

                  {processedAnnouncements.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <p className="font-display font-bold text-slate-600 text-base">No Matching Notices Found</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">Try resetting filters, searching for alternate titles, or generating a prototype notice via the Extractor.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: AI Counselor Chat interface */}
            {activeTab === 'advisor' && (
              <motion.div
                key="advisor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CampusChat profile={profile} announcements={announcements} />
              </motion.div>
            )}

            {/* TAB 3: Notice Extractor */}
            {activeTab === 'extractor' && (
              <motion.div
                key="extractor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DeadlineExtractor onAddExtractedAnnouncement={handleAddExtractedAnnouncement} />
              </motion.div>
            )}

            {/* TAB 4: Analytics Dashboard panel */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
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

          </AnimatePresence>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 py-5 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 National Engineering College • Powered by CampusAssist AI Counsel Suite</p>
      </footer>

      {/* Manual Add Announcement Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
                <span className="font-display font-bold text-base tracking-tight">Publish Campus Notice Board item</span>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleManualNoticeSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Notice/Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Zoho Corporation Hiring Sprint"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Notice Category</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Default Priority Level</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Brief Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide core instructions or description of the visit/event..."
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-205 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Event Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Venue</label>
                    <input
                      type="text"
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="IT Labs, etc."
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Deadline Date *</label>
                    <input
                      type="date"
                      required
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 border-indigo-400 rounded-lg text-xs font-bold text-indigo-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Target Departments (comma-separated)</label>
                    <input
                      type="text"
                      value={newDeptCriteria}
                      onChange={(e) => setNewDeptCriteria(e.target.value)}
                      placeholder="e.g. CSE, IT, AI&DS"
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Min CGPA Required</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMinCgpa}
                      onChange={(e) => setNewMinCgpa(e.target.value)}
                      placeholder="e.g. 7.5"
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Action Required *</label>
                  <input
                    type="text"
                    required
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="e.g. Log in to Zoho careers portal and apply"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-center hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Publish Notice Live
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
