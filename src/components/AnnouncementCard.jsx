import React, { useState } from 'react';
import { Calendar, MapPin, CheckCircle, ChevronDown, ChevronUp, Copy, Check, Sparkles, Bookmark, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnnouncementCard({
  announcement,
  profile,
  isViewed,
  isCompleted,
  isBookmarked,
  onMarkViewed,
  onToggleComplete,
  onToggleBookmark,
  index,
  darkMode
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
Title: ${announcement.title}
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

  // Calendar Event Generator (downloads standard .ics)
  const handleDownloadICS = (e) => {
    e.stopPropagation();
    const title = announcement.title;
    const desc = announcement.description;
    const deadline = announcement.deadline.replace(/-/g, ''); // YYYYMMDD
    const dateStr = announcement.date ? announcement.date.replace(/-/g, '') : deadline;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusAssist AI//Calendar Event//EN
BEGIN:VEVENT
UID:${announcement.id}@campusassist.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dateStr}T090000
DTEND:${dateStr}T170000
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${announcement.venue || 'NEC Campus'}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_deadline.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // PDF Exporter (opens a styled print layout)
  const handleExportPDF = (e) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Campus Notice - ${announcement.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; background: #fff; line-height: 1.6; }
            .header { border-bottom: 4px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 20px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; }
            .title { font-size: 26px; font-weight: 900; color: #1e293b; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
            .meta { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .section-title { font-size: 13px; font-weight: 900; color: #4f46e5; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .action-box { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; padding: 20px; border-radius: 12px; font-size: 13px; font-weight: 700; margin-bottom: 30px; text-transform: uppercase; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CampusAssist AI • NEC Portal</div>
            <div class="title">${announcement.title}</div>
            <div class="meta">Category: ${announcement.category} | Priority: ${announcement.priority}</div>
          </div>
          
          <div class="desc">
            <div class="section-title">Notice Summary</div>
            <p style="font-size: 14px; color: #334155;">${announcement.description}</p>
          </div>

          <div class="grid">
            <div class="card">
              <div class="section-title" style="border: none; margin-bottom: 5px;">Eligibility & Compatibility</div>
              <p style="font-size: 13px;"><strong>Target Branches:</strong> ${depts.length === 0 ? 'All Engineering Departments' : depts.join(', ')}</p>
              <p style="font-size: 13px;"><strong>Target Years:</strong> ${years.length === 0 ? 'All Batches' : years.map(y => `Year ${y}`).join(', ')}</p>
              <p style="font-size: 13px;"><strong>Academic CGPA Req:</strong> ${minCgpa > 0 ? `${minCgpa} or above` : 'No CGPA limit'}</p>
              <p style="font-size: 13px;"><strong>Profile Match Score:</strong> ${totalScore}/100 Match Points</p>
            </div>
            <div class="card">
              <div class="section-title" style="border: none; margin-bottom: 5px;">Event Location & Schedule</div>
              <p style="font-size: 13px;"><strong>Date:</strong> ${announcement.date || 'Multiple'}</p>
              <p style="font-size: 13px;"><strong>Time:</strong> ${announcement.time || 'N/A'}</p>
              <p style="font-size: 13px;"><strong>Venue:</strong> ${announcement.venue || 'NEC Campus'}</p>
              <p style="font-size: 13px; color: #dc2626;"><strong>Apply Deadline:</strong> ${announcement.deadline}</p>
            </div>
          </div>

          <div class="action-box">
            Required Steps: ${announcement.actionRequired}
          </div>

          <div style="text-align: center; margin-top: 40px;" class="no-print">
            <button onclick="window.print();" style="padding: 12px 24px; background: #6366f1; border: none; border-radius: 10px; color: white; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 11px; tracking-wider: 1px;">Print Report / Save as PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Check if deadline is close (< 3 days)
  const currTime = new Date('2026-06-14').getTime();
  const deadlineTime = new Date(announcement.deadline).getTime();
  const diffDays = Math.ceil((deadlineTime - currTime) / (1000 * 60 * 60 * 24));
  const isDeadlineClose = diffDays >= 0 && diffDays <= 3;

  let priorityBorderClass = 'border-l-8 border-indigo-500';
  let priorityBgClass = 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50';

  if (announcement.priority === 'HIGH') {
    priorityBorderClass = 'border-l-8 border-rose-500';
    priorityBgClass = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
  } else if (announcement.priority === 'MEDIUM') {
    priorityBorderClass = 'border-l-8 border-amber-500';
    priorityBgClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
  }

  return (
    <motion.div
      layout
      id={`announcement-${announcement.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onClick={handleCardClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md ${priorityBorderClass} ${
        isCompleted ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/30' : ''
      }`}
    >
      {/* Top Header Card row */}
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center flex-wrap gap-2">
            {/* Category */}
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-350 text-[9px] font-black uppercase tracking-widest rounded border border-slate-200 dark:border-slate-750">
              {announcement.category}
            </span>

            {/* Priority Badge */}
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${priorityBgClass}`}>
              Priority: {announcement.priority}
            </span>

            {/* Match Score Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
              totalScore >= 70 
                ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900' 
                : totalScore >= 40 
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 border-blue-150 dark:border-blue-900' 
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}>
              Score: {totalScore}/100
            </span>

            {!isViewed && (
              <span className="px-1.5 py-0.5 bg-indigo-650 text-white font-black text-[8px] uppercase tracking-wider rounded">
                NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-indigo-605 rounded-xl border border-slate-200 dark:border-slate-750 transition-all cursor-pointer"
              title="Bookmark announcement"
            >
              <Bookmark size={12} className={isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''} />
            </button>

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
                    : 'bg-slate-900 dark:bg-indigo-650 text-white hover:bg-slate-850 dark:hover:bg-indigo-700'
              }`}
            >
              {isCompleted ? '✓ Applied' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Title & Description of announcement */}
        <div className="space-y-1.5 text-left">
          <h4 className="font-sans font-black text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tight hover:text-indigo-600 transition-colors">
            {announcement.title}
          </h4>
          <p className="text-xs text-slate-550 dark:text-slate-400 mb-3 font-medium leading-relaxed">
            {announcement.description}
          </p>
        </div>

        {/* Core Date / Deadlines details */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <span>📅 {announcement.date ? announcement.date : 'Multiple Dates'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍 {announcement.venue || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className={`font-black uppercase tracking-tight ${isDeadlineClose ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
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
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-left"
          >
            <div className="p-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              {/* Export Panel Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadICS}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Calendar size={12} />
                  Add to Calendar (.ics)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <FileText size={12} />
                  Export Notice Report
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Copy size={12} />
                  {copied ? 'Copied!' : 'Copy Summary Sheet'}
                </button>
              </div>

              {/* Score compatibility breakout */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-205 text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-500" />
                  Score Compatibility Breakout: {totalScore}/100 Match Points
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${isDeptMatch ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-850'}`}>
                    <span className="font-bold">Branch Match</span>
                    <p className="mt-0.5">{isDeptMatch ? '+30 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isYearMatch ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-850'}`}>
                    <span className="font-bold">Year Match</span>
                    <p className="mt-0.5">{isYearMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isCgpaMatch ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-850'}`}>
                    <span className="font-bold">CGPA Req</span>
                    <p className="mt-0.5">{isCgpaMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isSkillMatch ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-850'}`}>
                    <span className="font-bold">Skill Match</span>
                    <p className="mt-0.5">{isSkillMatch ? '+20 Pts' : '0 Pts'}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${isInterestMatch ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-850'}`}>
                    <span className="font-bold">Interest Match</span>
                    <p className="mt-0.5">{isInterestMatch ? '+10 Pts' : '0 Pts'}</p>
                  </div>
                </div>
              </div>

              {/* Requirements Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Eligibility Metrics</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs font-medium text-slate-700 dark:text-slate-350">
                    <li>Required Branches: <span className="font-bold text-slate-800 dark:text-white">{depts.length === 0 ? 'All Engineering Departments' : depts.join(', ')}</span></li>
                    <li>Academic Years: <span className="font-bold text-slate-800 dark:text-white">{years.length === 0 ? 'All Students' : years.map(y => `Year ${y}`).join(', ')}</span></li>
                    <li>Required CGPA Threshold: <span className="font-bold text-slate-800 dark:text-white">{minCgpa > 0 ? `${minCgpa} or above` : 'No CGPA limit'}</span></li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Recommended Skills & Topics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skills.map((skill, index) => {
                      const matches = profile.skills.some(ps => ps.toLowerCase() === skill.toLowerCase());
                      return (
                        <span key={index} className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                          matches ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' : 'bg-slate-100 dark:bg-slate-850 text-slate-505 dark:text-slate-400 border-slate-205 dark:border-slate-800'
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
              <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-3.5">
                <span className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Required Action Steps:</span>
                <p className="text-xs font-medium text-slate-750 dark:text-slate-300 leading-relaxed">
                  {announcement.actionRequired}
                </p>
              </div>

              {/* Copyable announcement summary report block */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CampusReport Output Sheet</span>
                <pre className="bg-slate-900 text-slate-200 text-[11px] p-3 rounded-lg font-mono overflow-x-auto whitespace-pre-wrap select-all border border-slate-800">
                  {copyFormatText}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand/Collapse Footer handle */}
      <div className="bg-slate-50/80 dark:bg-slate-950/20 px-5 py-2.5 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-medium border-t border-slate-100 dark:border-slate-850">
        <span>Click to {isExpanded ? 'collapse' : 'reveal eligibility and actions'}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
    </motion.div>
  );
}
