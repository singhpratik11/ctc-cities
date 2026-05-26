import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../data/defaults.js';
import { fmtComma, parseComma } from '../utils/formatters.js';

export default function ExpenseTable({ cityName, expenses, monthlyInhand, onUpdate }) {
  const [editing, setEditing] = useState({});

  const handleBlur = (cat, val) => {
    const num = parseComma(val);
    onUpdate(cityName, cat, num);
    setEditing(e => { const n = { ...e }; delete n[cat]; return n; });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly expenses — {cityName}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 text-xs border-b border-gray-100 dark:border-gray-800">
            <th className="text-left py-2">Category</th>
            <th className="text-right py-2">₹/month</th>
            <th className="text-right py-2">% of in-hand</th>
          </tr>
        </thead>
        <tbody>
          {EXPENSE_CATEGORIES.map(cat => {
            const val = expenses?.[cat] || 0;
            const pct = monthlyInhand > 0 ? ((val / monthlyInhand) * 100).toFixed(1) : '—';
            return (
              <tr key={cat} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="py-2 text-gray-700 dark:text-gray-300">{cat}</td>
                <td className="py-1 text-right">
                  <input
                    className="w-28 text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 rounded px-2 py-0.5 text-gray-900 dark:text-white outline-none"
                    value={editing[cat] !== undefined ? editing[cat] : fmtComma(val)}
                    onChange={e => setEditing(ed => ({ ...ed, [cat]: e.target.value }))}
                    onFocus={() => setEditing(ed => ({ ...ed, [cat]: String(val) }))}
                    onBlur={e => handleBlur(cat, e.target.value)}
                  />
                </td>
                <td className="py-2 text-right text-gray-400 dark:text-gray-500 w-20">{pct}%</td>
              </tr>
            );
          })}
          <tr className="font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
            <td className="pt-2">Total</td>
            <td className="pt-2 text-right">
              ₹{fmtComma(EXPENSE_CATEGORIES.reduce((s, c) => s + (expenses?.[c] || 0), 0))}
            </td>
            <td className="pt-2 text-right text-gray-500 dark:text-gray-400">
              {monthlyInhand > 0
                ? ((EXPENSE_CATEGORIES.reduce((s, c) => s + (expenses?.[c] || 0), 0) / monthlyInhand) * 100).toFixed(1)
                : '—'}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
