import React, { useState } from 'react';
import { DEPARTMENTS } from '../data';
import { Edit2, Check, BookOpen, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentProfileCard({ profile, profiles = [], onChange, onSelectProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    onChange({ ...editedProfile });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter(s => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !editedProfile.interests.includes(newInterest.trim())) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter(i => i !== interest)
    });
  };

  const displayProfiles = profiles.length ? profiles : [profile];

  return (
    <div id="student-profile-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl uppercase tracking-wider shadow-inner border border-indigo-400">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-sans font-black text-white text-base leading-tight uppercase tracking-tighter">Campus ID Card</h3>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">National Eng. College</span>
          </div>
        </div>
        {!isEditing ? (
          <button
            id="btn-edit-profile"
            onClick={() => {
              setEditedProfile({ ...profile });
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            <Edit2 size={11} />
            Edit Profile
          </button>
        ) : (
          <button
            id="btn-save-profile"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            <Check size={11} />
            Save Profile
          </button>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Persona selection drop down */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Persona Swapper</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Switch student profile</p>
                </div>
                <select
                  value={profile.name}
                  onChange={(e) => {
                    if (onSelectProfile) {
                      onSelectProfile(e.target.value);
                    }
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-650 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  {displayProfiles.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.department} • CGPA {p.cgpa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Core student ID details */}
              <div className="flex items-start justify-between gap-2 text-left">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase whitespace-pre-wrap leading-tight">{profile.name}</h4>
                  <p className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 tracking-wider uppercase">REG: {profile.registerNumber}</p>
                </div>
                <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase rounded-lg tracking-widest border border-indigo-150 dark:border-indigo-850 shrink-0">
                  {profile.department}
                </div>
              </div>

              {/* Grid indices matching bold statistics boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center border border-slate-100 dark:border-slate-850">
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none">0{profile.year}</p>
                  <p className="text-[9px] font-black leading-none text-slate-500 mt-1 uppercase tracking-widest">Year</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-center border border-indigo-150 dark:border-indigo-850/50">
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">0{profile.semester}</p>
                  <p className="text-[9px] font-black leading-none text-indigo-500 dark:text-indigo-400/80 mt-1 uppercase tracking-widest">Sem</p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-center border border-rose-150 dark:border-rose-850/50">
                  <p className="text-xl font-black text-rose-600 dark:text-rose-455 leading-none">{profile.cgpa.toFixed(2)}</p>
                  <p className="text-[9px] font-black leading-none text-rose-550 mt-1 uppercase tracking-widest">CGPA</p>
                </div>
              </div>

              {/* Skills and interests */}
              <div className="space-y-4 text-left">
                <div>
                  <h5 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <BookOpen size={12} />
                    Registered Skills
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors border border-slate-200 dark:border-slate-800">
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No skills registered yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <Award size={12} />
                    General Interests
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-150 dark:border-indigo-900/60">
                        {interest}
                      </span>
                    ))}
                    {profile.interests.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No interests declared yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-left"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Register Number</label>
                  <input
                    type="text"
                    value={editedProfile.registerNumber}
                    onChange={e => setEditedProfile({ ...editedProfile, registerNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Department</label>
                  <select
                    value={editedProfile.department}
                    onChange={e => setEditedProfile({ ...editedProfile, department: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-200"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={editedProfile.year}
                    onChange={e => setEditedProfile({ ...editedProfile, year: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sem</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editedProfile.semester}
                    onChange={e => setEditedProfile({ ...editedProfile, semester: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={editedProfile.cgpa}
                  onChange={e => setEditedProfile({ ...editedProfile, cgpa: parseFloat(e.target.value) || 0.0 })}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Editable Skills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Skills (Press Enter or Add)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Node.js"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="p-1 px-2.5 bg-slate-850 dark:bg-slate-805 text-white hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editedProfile.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-medium rounded-full">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Editable Interests */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Interests</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity"
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="p-1 px-2.5 bg-slate-850 dark:bg-slate-805 text-white hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editedProfile.interests.map((interest, index) => (
                    <span key={index} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 text-xs font-medium rounded-full">
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)} className="p-0.5 rounded-full hover:bg-violet-200 dark:hover:bg-slate-700 text-violet-400 hover:text-violet-650 transition-colors cursor-pointer">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
