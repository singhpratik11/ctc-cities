import { useState } from 'react';
import { EXPENSE_CATEGORIES, DEFAULT_EXPENSES } from '../data/defaults.js';
import { fmtComma, parseComma } from '../utils/formatters.js';

export default function AddCityModal({ cities, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [copyFrom, setCopyFrom] = useState('');
  const [expenses, setExpenses] = useState(() =>
    EXPENSE_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {})
  );
  const [error, setError] = useState('');

  const handleCopyFrom = (source) => {
    setCopyFrom(source);
    if (source && DEFAULT_EXPENSES[source]) {
      setExpenses({ ...DEFAULT_EXPENSES[source] });
    } else if (source) {
      const city = cities.find(c => c.name === source);
      if (city) setExpenses({ ...DEFAULT_EXPENSES[city.name] || expenses });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('City name is required'); return; }
    if (cities.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('City already exists');
      return;
    }
    onAdd({ name: trimmed, expenses });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add city</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City name</label>
            <input
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Pune"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pre-fill expenses from</label>
            <select
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none"
              value={copyFrom}
              onChange={e => handleCopyFrom(e.target.value)}
            >
              <option value="">Enter manually</option>
              {cities.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly expenses (₹)</p>
            <div className="space-y-2">
              {EXPENSE_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400 w-32">{cat}</label>
                  <input
                    className="w-36 text-right border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none focus:border-blue-400"
                    value={fmtComma(expenses[cat])}
                    onChange={e => setExpenses(ex => ({ ...ex, [cat]: parseComma(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            Add city
          </button>
        </div>
      </div>
    </div>
  );
}
