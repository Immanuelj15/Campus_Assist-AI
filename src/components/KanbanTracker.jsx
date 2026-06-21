import React, { useState } from 'react';
import { Briefcase, Calendar, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { CURRENT_DATE_STR } from '../data';

const COLUMNS = [
  { id: 'Preparing', label: 'Preparing', color: 'slate' },
  { id: 'Applied', label: 'Applied', color: 'indigo' },
  { id: 'In Progress', label: 'In Progress', color: 'blue' },
  { id: 'Selected', label: 'Selected', color: 'emerald' },
  { id: 'Rejected', label: 'Rejected', color: 'rose' }
];

export default function KanbanTracker({
  placementPipelines = [],
  onAddPipeline,
  onRemovePipeline,
  onUpdatePipelineStatus
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [initialStatus, setInitialStatus] = useState('Preparing');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    onAddPipeline({
      companyName: companyName.trim(),
      status: initialStatus,
      dateApplied: CURRENT_DATE_STR,
      role: roleName.trim() || 'Software Engineer Intern'
    });

    setCompanyName('');
    setRoleName('');
    setInitialStatus('Preparing');
    setShowAddForm(false);
  };

  const moveCard = (company, direction) => {
    const currentItem = placementPipelines.find(p => p.companyName === company);
    if (!currentItem) return;

    const currentIndex = COLUMNS.findIndex(col => col.id === currentItem.status);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      onUpdatePipelineStatus(company, COLUMNS[newIndex].id);
    }
  };

  // KPIs
  const totalApps = placementPipelines.length;
  const selections = placementPipelines.filter(p => p.status === 'Selected').length;
  const inProgress = placementPipelines.filter(p => p.status === 'In Progress').length;
  const selectionRate = totalApps > 0 ? Math.round((selections / totalApps) * 100) : 0;

  return (
    <div id="kanban-tracker" className="space-y-6 text-left transition-colors duration-300">
      
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-indigo-650 dark:text-indigo-400" size={22} />
            Career Pipeline Tracker
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">
            Track and progress your company applications and internships
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          {showAddForm ? 'Close Drawer' : 'Add Application'}
        </button>
      </div>

      {/* Quick Add Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xl space-y-4 max-w-xl transition-all duration-300"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
            Log New Corporate Application
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zoho, Microsoft"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold uppercase tracking-wider text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer, QA Intern"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold uppercase tracking-wider text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5">
                Application Stage
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none font-bold uppercase tracking-wider cursor-pointer text-slate-800 dark:text-slate-205 text-slate-900 dark:text-white"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
            <div className="pt-5 shrink-0">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Save Tracker
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Funnel Bento Card Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Opportunities Tracked</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">{totalApps}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Active Selection Offers</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 leading-none">{selections}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Interviews & In Progress</span>
          <p className="text-2xl font-black text-blue-600 mt-1 leading-none">{inProgress}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Hiring Success Ratio</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 leading-none">{selectionRate}%</p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const cards = placementPipelines.filter(p => p.status === col.id);
          
          let colBorder = 'border-slate-200 dark:border-slate-800';
          let colBg = 'bg-slate-50/50 dark:bg-slate-950/40';
          let badgeColor = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
          let headerText = 'text-slate-700 dark:text-slate-300';
          
          if (col.id === 'Applied') {
            colBorder = 'border-indigo-100 dark:border-indigo-950/30';
            colBg = 'bg-indigo-50/10 dark:bg-indigo-950/10';
            badgeColor = 'bg-indigo-105 text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400';
            headerText = 'text-indigo-700 dark:text-indigo-450';
          } else if (col.id === 'In Progress') {
            colBorder = 'border-blue-105 dark:border-blue-950/30';
            colBg = 'bg-blue-50/10 dark:bg-blue-950/10';
            badgeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
            headerText = 'text-blue-700 dark:text-blue-450';
          } else if (col.id === 'Selected') {
            colBorder = 'border-emerald-100 dark:border-emerald-950/30';
            colBg = 'bg-emerald-50/10 dark:bg-emerald-950/10';
            badgeColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
            headerText = 'text-emerald-700 dark:text-emerald-450';
          } else if (col.id === 'Rejected') {
            colBorder = 'border-rose-100 dark:border-rose-950/30';
            colBg = 'bg-rose-50/10 dark:bg-rose-950/10';
            badgeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-450';
            headerText = 'text-rose-700 dark:text-rose-450';
          }

          return (
            <div
              key={col.id}
              className={`rounded-3xl border p-4 flex flex-col gap-3 min-h-[350px] transition-all duration-300 ${colBorder} ${colBg}`}
            >
              {/* Column Title Header */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${headerText}`}>
                  {col.label}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {cards.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-1">
                {cards.map((card) => (
                  <div
                    key={card.companyName}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left space-y-2 group relative overflow-hidden"
                  >
                    {/* Status accent indicator border */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                      col.id === 'Selected' ? 'bg-emerald-500' :
                      col.id === 'Applied' ? 'bg-indigo-500' :
                      col.id === 'In Progress' ? 'bg-blue-500' :
                      col.id === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                    }`}></div>

                    {/* Company Details */}
                    <div>
                      <div className="flex items-start justify-between gap-2 pl-1.5">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
                          {card.companyName}
                        </h4>
                        <button
                          onClick={() => onRemovePipeline(card.companyName)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                          title="Remove Application"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide mt-0.5 pl-1.5">
                        {card.role || 'Software Development'}
                      </p>
                    </div>

                    {/* Meta info date */}
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold pl-1.5">
                      <Calendar size={10} className="shrink-0" />
                      <span>{card.dateApplied}</span>
                    </div>

                    {/* Navigation Buttons for board movement */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-1 pl-1.5">
                      <button
                        onClick={() => moveCard(card.companyName, -1)}
                        disabled={col.id === 'Preparing'}
                        className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move Left"
                      >
                        <ChevronLeft size={13} />
                      </button>

                      {col.id === 'Selected' && (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={13} />
                      )}
                      {col.id === 'Rejected' && (
                        <XCircle className="text-rose-500 shrink-0" size={13} />
                      )}

                      <button
                        onClick={() => moveCard(card.companyName, 1)}
                        disabled={col.id === 'Rejected'}
                        className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move Right"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="py-8 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl select-none">
                    Empty Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
