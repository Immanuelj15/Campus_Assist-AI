import React, { useState, useRef, useEffect } from 'react';
import { SUGGESTED_QUERIES } from '../data';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CampusChat({ profile, announcements, darkMode }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${profile.name}! 👋 Welcome to CampusAssist AI.

I'm your dedicated smart counselor for National Engineering College. My goal is to navigate you through academic announcements, placement details, internship vacancies, active hackathons, and help you meet high-priority deadlines.

How can I help you excel today? You can select code examples or talk to me in natural language!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const listEndRef = useRef(null);

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsgId = Date.now().toString() + '-user';
    const updatedMessages = [
      ...messages,
      { id: userMsgId, role: 'user', text: trimmed }
    ];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    setApiError(null);

    try {
      // Package conversation history for the backend
      const history = updatedMessages
        .slice(1, -1) // skip the initial greeting and the newly added user message
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: history,
          profile: profile,
          announcements: announcements
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const botText = data.reply || "Sorry, I am unable to process that at the moment.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-bot', role: 'model', text: botText }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setApiError(err?.message || 'Failed to exchange messages with CampusAssist AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="campus-chat-container" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[550px] overflow-hidden text-left transition-all duration-300">
      {/* Bot Chat Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl border border-indigo-400">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-sans font-black text-white text-base uppercase tracking-tighter flex items-center gap-1.5 leading-none">
              CAMPUS WISDOM ENG.
              <Sparkles size={11} className="text-indigo-400 fill-indigo-400" />
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              Counselor Agent Online
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                role: 'model',
                text: `Hello ${profile.name}! 👋 Welcome back.
 
I've refreshed our conversation history. Feel free to query me about upcoming internships, placements, workshops, scholarships, and exam schedules!`
              }
            ]);
            setApiError(null);
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Reset Chat"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages Feed panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/70 dark:bg-slate-950/20">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isBot = message.role === 'model';
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Profile icon */}
                <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 ${
                  isBot ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 dark:bg-slate-700 text-slate-100 shadow-sm'
                }`}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  isBot 
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 border border-slate-150 dark:border-slate-800' 
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  {message.text}
                </div>
              </motion.div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="p-2 rounded-xl h-9 w-9 bg-indigo-600 text-white flex items-center justify-center animate-spin">
                <RefreshCw size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 text-slate-450 dark:text-slate-400 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium flex items-center gap-2 shadow-sm">
                <span>Thinking... Consulting announcements database</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-605 bg-indigo-600 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-605 bg-indigo-600 rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-605 bg-indigo-600 rounded-full animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-[85%] mr-auto">
              <AlertCircle size={14} className="text-rose-600 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}
        </AnimatePresence>
        <div ref={listEndRef} />
      </div>

      {/* Suggested Quick Queries wrapper */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-left transition-colors duration-300">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Suggested Queries:</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1.5 text-[10px] bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-350 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 transition-colors duration-300"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask anything (e.g. "What CGPA is required for Zoho placement?")`}
          className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case text-slate-850 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 px-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-755 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border dark:border-indigo-500"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
