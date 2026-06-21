import React from 'react';
import { CURRENT_DATE_STR } from '../data';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function RemindersList({ announcements, completedActions }) {
  // Current date as timestamp
  const currTime = new Date(CURRENT_DATE_STR).getTime();

  // Find all HIGH priority items
  const highPriorityItems = announcements.filter(
    (ann) => ann.priority === 'HIGH' && !completedActions.includes(ann.id)
  );

  // Map to reminder instances with days calculations
  const activeReminders = highPriorityItems
    .map((ann) => {
      const deadlineTime = new Date(ann.deadline).getTime();
      const diffTime = deadlineTime - currTime;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ann, daysRemaining };
    })
    // Show reminders only for upcoming or today's issues
    .filter(({ daysRemaining }) => daysRemaining >= 0 && daysRemaining <= 7);

  return (
    <div id="reminders-list" className="bg-slate-900 dark:bg-slate-900/80 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden border border-slate-800/50">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 text-indigo-400 mb-4">
        <AlertTriangle className="animate-pulse" size={18} />
        <h3 className="font-sans font-black text-xs uppercase tracking-widest">Urgency Reminders</h3>
      </div>

      {activeReminders.length === 0 ? (
        <div className="text-center py-6 bg-slate-800/40 rounded-2xl border border-dashed border-slate-800">
          <p className="text-xs font-black uppercase tracking-wider text-indigo-300">All Up To Date</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Excellent! No high priority deadlines left within the next 7 days.</p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {activeReminders.map(({ ann, daysRemaining }, idx) => {
            // Determine active reminder bracket
            let bracketLabel = 'Urgent Notice';
            let bracketTheme = 'text-amber-400';

            if (daysRemaining === 7) {
              bracketLabel = '7 Days Left';
              bracketTheme = 'text-blue-400 dark:text-blue-400';
            } else if (daysRemaining <= 3 && daysRemaining > 1) {
              bracketLabel = '3 Days Left';
              bracketTheme = 'text-orange-400';
            } else if (daysRemaining <= 1) {
              bracketLabel = 'Urgent: 1 Day Left!';
              bracketTheme = 'text-rose-400';
            }

            // Calculate percentage for a neat visual timeline tracker
            const percent = Math.max(10, Math.min(100, Math.round(((7 - daysRemaining) / 7) * 100)));

            return (
              <motion.div
                key={ann.id}
                id={`reminder-${ann.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="bg-slate-800/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${bracketTheme}`}>
                      ⚠️ {bracketLabel}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      {daysRemaining} DAYS REMAINING
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Event:</span>
                    <p className="text-sm font-black uppercase leading-tight truncate text-white mb-1.5">{ann.title}</p>
                    
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Deadline:</span>
                    <p className="text-xs font-black italic text-indigo-300 mb-2">{ann.deadline}</p>
                    
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Action Required:</span>
                    <p className="text-[11px] text-slate-300 font-medium leading-tight mb-3 whitespace-pre-wrap">{ann.actionRequired}</p>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1 mt-1 pointer-events-none">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
