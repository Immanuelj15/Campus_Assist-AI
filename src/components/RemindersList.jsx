import React from 'react';
import { CURRENT_DATE_STR } from '../data';
import { AlertTriangle, CheckCircle, Clock, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    .filter(({ daysRemaining }) => daysRemaining >= 0 && daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div id="reminders-list" className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-800 border border-indigo-100/50 relative overflow-hidden group">
      {/* Decorative blurred background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 transition-transform duration-700 group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-600 shadow-sm">
              <AlertTriangle size={16} className="animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-rose-300 animate-ping opacity-20"></div>
            </div>
            <h3 className="font-sans font-black text-sm uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600">
              Urgency Reminders
            </h3>
          </div>
          {activeReminders.length > 0 && (
            <span className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
              {activeReminders.length} Active
            </span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {activeReminders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-10 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-indigo-200 shadow-inner"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-500 shadow-sm relative">
                <CheckCircle size={32} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 blur-md"
                />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-1">All Up To Date</p>
              <p className="text-xs text-slate-500 font-medium text-center max-w-[200px]">You have beautifully cleared your schedule. Breathe easy!</p>
            </motion.div>
          ) : (
            <div className="space-y-4 text-left">
              {activeReminders.map(({ ann, daysRemaining }, idx) => {
                let bracketLabel = 'Action Needed';
                let bracketTheme = 'from-amber-500 to-orange-500 text-amber-700 bg-amber-50';
                let barColor = 'bg-gradient-to-r from-amber-400 to-orange-500';
                let icon = <Clock size={12} />;

                if (daysRemaining === 7) {
                  bracketLabel = '1 Week Left';
                  bracketTheme = 'from-indigo-500 to-blue-500 text-indigo-700 bg-indigo-50';
                  barColor = 'bg-gradient-to-r from-indigo-400 to-blue-500';
                  icon = <Calendar size={12} />;
                } else if (daysRemaining <= 3 && daysRemaining > 1) {
                  bracketLabel = '3 Days Left';
                  bracketTheme = 'from-orange-500 to-rose-500 text-orange-700 bg-orange-50';
                  barColor = 'bg-gradient-to-r from-orange-400 to-rose-500';
                } else if (daysRemaining <= 1) {
                  bracketLabel = 'Due Tomorrow!';
                  bracketTheme = 'from-rose-500 to-pink-500 text-rose-700 bg-rose-50';
                  barColor = 'bg-gradient-to-r from-rose-500 to-pink-600';
                }

                // Calculate percentage for a neat visual timeline tracker
                const percent = Math.max(10, Math.min(100, Math.round(((7 - daysRemaining) / 7) * 100)));

                return (
                  <motion.div
                    key={ann.id}
                    id={`reminder-${ann.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                    className="group/card relative bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-full transition-all duration-700 rounded-2xl pointer-events-none" style={{ backgroundSize: '200% 100%' }}></div>

                    <div className="flex flex-col gap-3 relative z-10">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${bracketTheme}`}>
                          {icon}
                          {bracketLabel}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                          {daysRemaining} DAYS REMAINING
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-black uppercase tracking-wide leading-tight text-slate-800 mb-1.5 group-hover/card:text-indigo-700 transition-colors line-clamp-1">
                            {ann.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-2">
                            {ann.actionRequired}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Due:</span>
                            <span className="text-slate-600">{ann.deadline}</span>
                          </div>
                        </div>
                        
                        {/* Interactive button hint */}
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/card:bg-indigo-50 group-hover/card:text-indigo-600 group-hover/card:border-indigo-100 transition-colors shrink-0">
                          <ChevronRight size={14} className="group-hover/card:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                          className={`h-full rounded-full ${barColor}`} 
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
