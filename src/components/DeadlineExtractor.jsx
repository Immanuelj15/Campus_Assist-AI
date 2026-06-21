import React, { useState } from 'react';
import { FileText, Cpu, Check, AlertCircle, PlusCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DeadlineExtractor({ onAddExtractedAnnouncement }) {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const sampleNotice = `Hi students, there is an upcoming technical workshop on CyberSecurity organized by NIT and NEC Club on June 22, 2026 at 10 AM. It will happen in IT Lab 4. Open to IT, CSE and AI&DS students of 2nd and 3rd years. Minimum CGPA recommended is 7.5. To register fill out the Google Web form. The deadline to apply is June 19, 2026. Make sure to sign up on time!`;

  const handleExtract = async () => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setExtractedData(null);
    setSuccessMsg(false);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: trimmed })
      });

      if (!res.ok) {
        throw new Error(`Failed with status code: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setExtractedData(data);
    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMsg(err?.message || 'Failed to extract event details. Please review your input.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToFeed = () => {
    if (!extractedData) return;

    const newId = `ann-extracted-${Date.now()}`;
    const announcement = {
      id: newId,
      title: extractedData.title || 'Extracted Announcement',
      category: extractedData.category || 'General Notice',
      priority: extractedData.priority || 'LOW',
      description: extractedData.description || 'Processed notice details.',
      date: extractedData.date || 'Multiple Dates',
      time: extractedData.time || '',
      venue: extractedData.venue || 'NEC Campus',
      eligibility: {
        departments: extractedData.eligibility?.departments || [],
        years: extractedData.eligibility?.years || [],
        minCgpa: extractedData.eligibility?.minCgpa || undefined,
        skills: extractedData.eligibility?.skills || [],
        interests: extractedData.eligibility?.interests || []
      },
      deadline: extractedData.deadline || '2026-06-30',
      actionRequired: extractedData.actionRequired || 'Review notice instructions.'
    };

    onAddExtractedAnnouncement(announcement);
    setSuccessMsg(true);
    setRawText('');
    setExtractedData(null);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div id="deadline-extractor-container" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 text-left transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-sans font-black text-xl border border-indigo-400">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="font-sans font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter">AI NOTICE EXTRACTOR</h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Transform messy announcements into active structured deadlines</p>
        </div>
      </div>

      <div className="space-y-3.5">
        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Raw Announcement Message Body</label>
        <textarea
          rows={5}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste unstructured email, WhatsApp forward notice, or bulletin board texts here..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-medium text-slate-900 dark:text-white"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <button
            onClick={() => setRawText(sampleNotice)}
            className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle size={13} />
            Insert Sample Text Notice
          </button>

          <button
            onClick={handleExtract}
            disabled={!rawText.trim() || isProcessing}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 flex items-center justify-center gap-2 transition-colors cursor-pointer border dark:border-indigo-500"
          >
            <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
            {isProcessing ? 'Extracting with Groq...' : 'Extract Deadlines'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span>Successfully parsed and loaded into the Campus Opportunities Feed! Notice is now live.</span>
          </motion.div>
        )}

        {extractedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-5 space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-900 pb-3">
              <span className="font-sans font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={14} className="text-indigo-600 animate-pulse" />
                Groq AI Extracted Schema Output
              </span>
              <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded border ${
                extractedData.priority === 'HIGH'
                  ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                  : extractedData.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}>
                {extractedData.priority} Priority
              </span>
            </div>

            {/* Display EXACT fields format */}
            <div className="space-y-4 leading-relaxed text-sm">
              <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-1 select-all">
                <div className="text-amber-400 font-bold mb-2 flex items-center gap-1">
                  <span>✨ Extracted Report</span>
                </div>
                <p><span className="text-slate-400">Event:</span> {extractedData.title}</p>
                <p><span className="text-slate-400">Category:</span> {extractedData.category}</p>
                <p><span className="text-slate-400">Priority:</span> {extractedData.priority}</p>
                <p><span className="text-slate-400">Date:</span> {extractedData.date || 'Multiple'}</p>
                <p><span className="text-slate-400">Deadline:</span> {extractedData.deadline}</p>
                <p><span className="text-slate-400">Venue:</span> {extractedData.venue || 'NEC Campus'}</p>
                <p><span className="text-slate-400">Eligibility:</span> Depts: {extractedData.eligibility?.departments?.join(', ') || 'All'}, Year: {extractedData.eligibility?.years?.join(', ') || 'All'}, Min CGPA: {extractedData.eligibility?.minCgpa || 'None'}</p>
                <p><span className="text-slate-400">Action Required:</span> <span className="text-indigo-300 font-bold">{extractedData.actionRequired}</span></p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleAddToFeed}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <PlusCircle size={14} />
                  Add to Opportunities Feed
                </button>
                <button
                  onClick={() => setExtractedData(null)}
                  className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border dark:border-slate-700"
                >
                  Discard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
