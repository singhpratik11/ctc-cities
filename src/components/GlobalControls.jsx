import { useState } from 'react';
import { fmtComma, parseComma } from '../utils/formatters.js';

export default function GlobalControls({ ctc, setCTC, regime, setRegime, viewMode, setViewMode, darkMode, setDarkMode }) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
      {/* CTC input */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">CTC</span>
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <span className="px-2 py-1.5 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-200 dark:border-gray-700">₹</span>
          <input
            className="w-32 px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent outline-none"
            value={focused ? raw : fmtComma(ctc)}
            onFocus={() => { setFocused(true); setRaw(String(ctc)); }}
            onBlur={e => {
              const val = parseComma(e.target.value);
              if (val > 0) setCTC(val);
              setFocused(false);
            }}
            onChange={e => setRaw(e.target.value)}
            step={50000}
            placeholder="20,00,000"
          />
        </div>
      </div>

      {/* Regime toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
        {['new', 'old'].map(r => (
          <button
            key={r}
            onClick={() => setRegime(r)}
            className={`px-3 py-1.5 capitalize transition-colors ${
              regime === r
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
        {['Monthly', 'Annual'].map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-3 py-1.5 transition-colors ${
              viewMode === v
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="ml-auto p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-base"
        title="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
