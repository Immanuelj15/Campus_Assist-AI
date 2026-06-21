import React, { useState } from 'react';
import { Calendar, MapPin, CheckCircle, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnnouncementCard({
  announcement,
  profile,
  isViewed,
  isCompleted,
  onMarkViewed,
  onToggleComplete,
  index
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Score Calculations
  const depts = announcement.eligibility?.departments || [];
  const years = announcement.eligibility?.years || [];
  const minCgpa = announcement.eligibility?.minCgpa || 0;
  const skills = announcement.eligibility?.skills || [];
  const interests = announcement.eligibility?.interests || [];

  const isDeptMatch = depts.length === 0 || depts.includes(profile.department);
  const isYearMatch = years.length === 0 || years.includes(profile.year);
  const isCgpaMatch = profile.cgpa >= minCgpa;
  
  const skillMatches = skills.filter(s => 
    profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
  );
  const isSkillMatch = skillMatches.length > 0;

  const interestMatches = interests.filter(i => 
    profile.interests.some(pi => pi.toLowerCase() === i.toLowerCase())
  );
  const isInterestMatch = interestMatches.length > 0;

  const deptContribution = isDeptMatch ? 30 : 0;
  const yearContribution = isYearMatch ? 20 : 0;
  const cgpaContribution = isCgpaMatch ? 20 : 0;
  const skillContribution = isSkillMatch ? 20 : 0;
  const interestContribution = isInterestMatch ? 10 : 0;

  const totalScore = deptContribution + yearContribution + cgpaContribution + skillContribution + interestContribution;

  // Formatting strings for direct copying in required format
  const copyFormatText = `Category: ${announcement.category}
Priority: ${announcement.priority}
Summary: ${announcement.description}
Eligibility: Depts: ${depts.join(', ') || 'All'}, Year: ${years.join(', ') || 'All'}, Min CGPA: ${minCgpa || 'None'}
Deadline: ${announcement.deadline}
Recommended For: ${totalScore} Match points (${profile.name} - ${profile.department} Dept)
Action Required: ${announcement.actionRequired}`;

  const copyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(copyFormatText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (!isViewed) {
      onMarkViewed();
    }
  };

  // Check if deadline is close (< 3 days)
  const currTime = new Date('2026-06-14').getTime();
  const deadlineTime = new Date(announcement.deadline).getTime();
  const diffDays = Math.ceil((deadlineTime - currTime) / (1000 * 60 * 60 * 24));
  const isDeadlineClose = diffDays >= 0 && diffDays <= 3;

  let priorityBorderClass = 'border-l-8 border-indigo-500';
  let priorityBgClass = 'bg-indigo-50/50 text-indigo-700 border-indigo-100';

  if (announcement.priority === 'HIGH') {
    priorityBorderClass = 'border-l-8 border-rose-500';
    priorityBgClass = 'bg-rose-105 text-rose-600';
  } else if (announcement.priority === 'MEDIUM') {
    priorityBorderClass = 'border-l-8 border-amber-500';
    priorityBgClass = 'bg-amber-105 text-amber-600';
  }

  return (
    <motion.div
      layout
      id={`announcement-${announcement.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onClick={handleCardClick}
      className={`bg-white rounded-2xl border-t border-r border-b border-slate-200 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md ${priorityBorderClass} ${
        isCompleted ? 'opacity-70 bg-slate-50/50' : ''
      }`}
    >
      {/* Top Header Card row */}
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center flex-wrap gap-2">
            {/* Category */}
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded">
              {announcement.category}
            </span>

            {/* Priority Badge */}
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${priorityBgClass}`}>
              Priority: {announcement.priority}
            </span>

            {/* Match Score Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${
              totalScore >= 70 
                ? 'bg-indigo-50 text-indigo-600 font-mono' 
                : totalScore >= 40 
                  ? 'bg-blue-50 text-blue-600 font-mono' 
                  : 'bg-slate-50 text-slate-500 font-mono'
            }`}>
              Score: {totalScore}/100
            </span>

            {!isViewed && (
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white font-black text-[8px] uppercase tracking-wider rounded">
                NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Action Completion Toggle */}
            <button
              type="button"
              id={`btn-complete-${announcement.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : announcement.priority === 'HIGH'
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isCompleted ? '✓ Done' : 'Apply Now'}
            </button>

            <button
              onClick={copyToClipboard}
              className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-all cursor-pointer"
              title="Copy Summary Report"
            >
              {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>
        </div>

        {/* Title & Description of announcement */}
        <div className="space-y-1.5">
          <h4 className="font-sans font-black text-slate-900 text-lg leading-tight uppercase tracking-tight hover:text-indigo-600 transition-colors">
            {announcement.title}
          </h4>
          <p className="text-xs text-slate-500 mb-3 font-medium leading-relaxed">
            {announcement.description}
          </p>
        </div>

        {/* Core Date / Deadlines details */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-100 mt-4 text-[10px] font-bold uppercase text-slate-400">
          <div className="flex items-center gap-1">
            <span>📅 {announcement.date ? announcement.date : 'Multiple Dates'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍 {announcement.venue || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className={`font-black uppercase tracking-tight ${isDeadlineClose ? 'text-rose-600' : 'text-slate-900'}`}>
              DEADLINE: {announcement.deadline}
            </span>
            {isDeadlineClose && (
              <span className="text-[9px] text-rose-500 font-mono tracking-tighter uppercase font-black">
                ({diffDays}d left!)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable detailed section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 bg-slate-50/60"
          >
            <div className="p-5 space-y-4 text-sm text-slate-700">
              {/* Score composition breakout */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-sm space-y-2">
                <p className="font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-500" />
                  Score Compatibility Breakout: {totalScore}/100 Match Points
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${isDeptMatch ? 'bg-indigo-50/50 text-indigo-750 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="font-bold">Branch Match</span>
                    <p className="mt-0.5">{isDeptMatch ? '+30 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isYearMatch ? 'bg-indigo-50/50 text-indigo-750 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="font-bold">Year Match</span>
                    <p className="mt-0.5">{isYearMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isCgpaMatch ? 'bg-indigo-50/50 text-indigo-750 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="font-bold">CGPA Req</span>
                    <p className="mt-0.5">{isCgpaMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isSkillMatch ? 'bg-indigo-50/50 text-indigo-750 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="font-bold">Skill Match</span>
                    <p className="mt-0.5">{isSkillMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isInterestMatch ? 'bg-indigo-50/50 text-indigo-750 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="font-bold">Interest Match</span>
                    <p className="mt-0.5">{isInterestMatch ? '+10 Pts' : '0 Pts'}</p>
                  </div>
                </div>
              </div>

              {/* Requirements Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Eligibility Metrics</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs font-medium text-slate-700">
                    <li>Required Branches: <span className="font-bold text-slate-800">{depts.length === 0 ? 'All Engineering Departments' : depts.join(', ')}</span></li>
                    <li>Academic Years: <span className="font-bold text-slate-800">{years.length === 0 ? 'All Students' : years.map(y => `Year ${y}`).join(', ')}</span></li>
                    <li>Required CGPA Threshold: <span className="font-bold text-slate-800">{minCgpa > 0 ? `${minCgpa} or above` : 'No CGPA limit'}</span></li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Skills & Topics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skills.map((skill, index) => {
                      const matches = profile.skills.some(ps => ps.toLowerCase() === skill.toLowerCase());
                      return (
                        <span key={index} className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                          matches ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {skill} {matches && '✓'}
                        </span>
                      );
                    })}
                    {skills.length === 0 && <span className="text-xs italic text-slate-400">None specified</span>}
                  </div>
                </div>
              </div>

              {/* Action Required Box */}
              <div className="bg-amber-50/30 border border-amber-200/50 rounded-xl p-3.5">
                <span className="text-xs font-bold text-slate-600 block mb-1">Required Action Steps:</span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {announcement.actionRequired}
                </p>
              </div>

              {/* Copyable announcement summary report block */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CampusReport Output Sheet</span>
                <pre className="bg-slate-900 text-slate-200 text-[11px] p-3 rounded-lg font-mono overflow-x-auto whitespace-pre-wrap select-all border border-slate-800">
                  {copyFormatText}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand/Collapse Footer handle */}
      <div className="bg-slate-50/80 px-5 py-2.5 flex justify-between items-center text-xs text-slate-400 font-medium">
        <span>Click to {isExpanded ? 'collapse' : 'reveal eligibility and details'}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
    </motion.div>
  );
}
