import React, { useState } from 'react';
import { CURRENT_DATE_STR } from '../data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Plus, Briefcase, Trash2 } from 'lucide-react';

export default function AnalyticsPanel({
  announcements,
  viewedIds,
  completedIds,
  placementPipelines,
  onAddPipeline,
  onRemovePipeline
}) {
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState('Preparing');

  // Calculates missed deadlines (deadline before mock system date June 14, 2026 AND not marked completed)
  const todayMs = new Date(CURRENT_DATE_STR).getTime();
  const missedDeadlines = announcements.filter((ann) => {
    const isPast = new Date(ann.deadline).getTime() < todayMs;
    const isPending = !completedIds.includes(ann.id);
    return isPast && isPending;
  });

  // Calculate Most Popular Categories as Recharts dataset
  const categoryFreq = announcements.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryFreq).map((cat) => ({
    name: cat,
    value: categoryFreq[cat],
  })).sort((a, b) => b.value - a.value);

  // PIE CHART COLORS
  const COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#1e293b'];

  const handleAddPipelineSubmit = (e) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    onAddPipeline({
      companyName: newCompany.trim(),
      status: newStatus,
      dateApplied: CURRENT_DATE_STR
    });
    setNewCompany('');
  };

  // KPI calculations
  const totalCount = announcements.length;
  const viewedCount = viewedIds.filter(id => announcements.some(a => a.id === id)).length;
  const engagementRate = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0;

  return (
    <div id="analytics-panel" className="space-y-6 text-left transition-colors duration-300">
      {/* Bento Grid KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Notices</span>
          <p className="text-3xl font-sans font-black text-slate-900 dark:text-white leading-none py-1">{totalCount}</p>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Academic active items</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Viewed Milestone</span>
          <p className="text-3xl font-sans font-black text-indigo-600 dark:text-indigo-400 leading-none py-1">{viewedCount} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">/ {totalCount}</span></p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 pointer-events-none">
            <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: `${engagementRate}%` }}></div>
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{engagementRate}% interaction speed</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Missed Milestones</span>
          <p className={`text-3xl font-sans font-black leading-none py-1 ${missedDeadlines.length > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {missedDeadlines.length}
          </p>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
            {missedDeadlines.length > 0 ? 'Urgent attention required' : 'Zero late items'}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Applied Funnel</span>
          <p className="text-3xl font-sans font-black text-emerald-600 dark:text-emerald-400 leading-none py-1">
            {placementPipelines.filter(x => x.status === 'Applied' || x.status === 'Selected').length}
          </p>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Involved placement drivers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Categories Chart element */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-sans font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest text-left">Opportunity Categories</h4>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-left">Distribution frequency of incoming campus notice boards</p>
          
          <div className="h-[250px] w-full mt-2">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic">No category data loaded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '700' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: '700' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Placement Participation pipelines management */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-sans font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest text-left">Placement Active Roadmap</h4>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-left">Register and organize recruitment and placement tracks</p>

          {/* Form to submit a driver pipeline entry */}
          <form onSubmit={handleAddPipelineSubmit} className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center text-left">
            <input
              type="text"
              placeholder="Company name, e.g. Zoho"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="flex-1 min-w-[140px] px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case placeholder:font-medium text-slate-900 dark:text-white"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-bold uppercase tracking-wide cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="Preparing">Preparing</option>
              <option value="Applied">Applied</option>
              <option value="In Progress">In Progress</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm border border-slate-950 dark:border-indigo-500"
            >
              <Plus size={11} />
              Add Tracker
            </button>
          </form>

          {/* List of current trackers */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-left">
            {placementPipelines.map((pipe) => {
              let statusStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
              if (pipe.status === 'Selected') statusStyle = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black border border-emerald-200 dark:border-emerald-900/60';
              if (pipe.status === 'Applied') statusStyle = 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-black border border-indigo-200 dark:border-indigo-900/60';
              if (pipe.status === 'In Progress') statusStyle = 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60';
              if (pipe.status === 'Rejected') statusStyle = 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60';

              return (
                <div key={pipe.companyName} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{pipe.companyName}</span>
                    <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 font-bold">({pipe.dateApplied})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${statusStyle}`}>
                      {pipe.status}
                    </span>
                    <button
                      onClick={() => onRemovePipeline(pipe.companyName)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
            {placementPipelines.length === 0 && (
              <div className="text-center py-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">No corporate placement statuses recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
