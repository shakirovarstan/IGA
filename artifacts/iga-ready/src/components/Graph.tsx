import React from 'react';
import { motion } from 'motion/react';

interface GraphProps {
  type: 'travel' | 'bar';
  data: any;
  lang: 'ru' | 'ky';
}

export const Graph: React.FC<GraphProps> = ({ type, data, lang }) => {
  if (type === 'bar') {
    const max = Math.max(...data);
    return (
      <div className="w-full h-48 flex items-end justify-around bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
        {data.map((val: number, i: number) => (
          <div key={i} className="flex flex-col items-center space-y-2 flex-1 h-full">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500">{val}</div>
            <div className="flex-1 w-full flex items-end justify-center px-1">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(val / max) * 100}%` }}
                className="w-full max-w-[32px] bg-blue-500 rounded-t-lg shadow-lg shadow-blue-500/20"
              />
            </div>
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400">
              {lang === 'ru' ? `День ${i + 1}` : `${i + 1}-күн`}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'travel') {
    // Basic travel graph using SVG
    return (
      <div className="w-full aspect-video bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Grid lines */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(x => (
            <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="60" stroke="currentColor" strokeWidth="0.1" className="text-slate-200 dark:text-slate-700" />
          ))}
          {[0, 10, 20, 30, 40, 50, 60].map(y => (
            <line key={`y-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.1" className="text-slate-200 dark:text-slate-700" />
          ))}
          
          {/* Axes */}
          <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
          <line x1="0" y1="0" x2="0" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
          
          {/* Path */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={data.path}
            fill="none"
            stroke="url(#graphGradient)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute bottom-2 right-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {lang === 'ru' ? 'Время (ч)' : 'Убакыт (саат)'}
        </div>
        <div className="absolute top-4 left-2 text-[8px] font-black text-slate-400 uppercase tracking-widest rotate-90 origin-left">
          {lang === 'ru' ? 'Путь (км)' : 'Жол (км)'}
        </div>
      </div>
    );
  }

  return null;
};
