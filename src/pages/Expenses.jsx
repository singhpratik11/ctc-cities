import { useState, useMemo } from 'react';
import { EXPENSE_CATEGORIES } from '../data/defaults.js';
import { fmtComma, parseComma, fmtINR, fmtL } from '../utils/formatters.js';
import { calcCityFinance } from '../utils/taxCalc.js';

function EditableCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  return (
    <td className="px-3 py-2 text-right">
      {editing ? (
        <input
          autoFocus
          className="w-24 text-right bg-blue-50 dark:bg-blue-950 border border-blue-400 rounded px-2 py-0.5 text-sm text-gray-900 dark:text-white outline-none"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onBlur={() => {
            onChange(parseComma(raw));
            setEditing(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') { setEditing(false); }
          }}
        />
      ) : (
        <button
          className="w-full text-right text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-0.5 transition-colors"
          onClick={() => { setRaw(String(value)); setEditing(true); }}
        >
          {value === 0 ? <span className="text-gray-300 dark:text-gray-600">—</span> : fmtComma(value)}
        </button>
      )}
    </td>
  );
}

export default function Expenses({ cities, expenses, updateExpense, ctc, regime, settings }) {
  const pct = (settings.basicPct || 40) / 100;

  const cityFinance = useMemo(() =>
    Object.fromEntries(cities.map(c => [
      c.name,
      calcCityFinance(ctc, regime, expenses[c.name] || {}, pct, settings.includePF),
    ])),
    [cities, expenses, ctc, regime, pct, settings.includePF]
  );

  const totals = useMemo(() =>
    Object.fromEntries(cities.map(c => [
      c.name,
      EXPENSE_CATEGORIES.reduce((s, cat) => s + (expenses[c.name]?.[cat] || 0), 0),
    ])),
    [cities, expenses]
  );

  return (
    <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense data</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Click any cell to edit. All changes update every chart instantly.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="sticky left-0 bg-white dark:bg-gray-900 px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36 z-10">
                Category
              </th>
              {cities.map(c => (
                <th key={c.name} className="px-3 py-3 text-right min-w-[120px]">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-gray-900 dark:text-white">{c.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {EXPENSE_CATEGORIES.map((cat, i) => (
              <tr
                key={cat}
                className={`border-b border-gray-50 dark:border-gray-800/60 ${
                  i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'
                }`}
              >
                <td className="sticky left-0 bg-white dark:bg-gray-900 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 z-10">
                  {cat}
                </td>
                {cities.map(c => (
                  <EditableCell
                    key={c.name}
                    value={expenses[c.name]?.[cat] || 0}
                    onChange={val => updateExpense(c.name, cat, val)}
                  />
                ))}
              </tr>
            ))}

            {/* Total row */}
            <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
              <td className="sticky left-0 bg-gray-50 dark:bg-gray-800/40 px-4 py-2.5 font-semibold text-gray-900 dark:text-white z-10">
                Total / month
              </td>
              {cities.map(c => (
                <td key={c.name} className="px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-white">
                  {fmtINR(totals[c.name])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* City summary strip */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cities.map(c => {
          const f = cityFinance[c.name];
          const surplus = f.monthlySavings;
          return (
            <div
              key={c.name}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">In-hand/mo</span>
                  <span className="font-medium text-gray-900 dark:text-white">{fmtL(f.monthlyInhand)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Expenses/mo</span>
                  <span className="font-medium text-gray-900 dark:text-white">{fmtINR(totals[c.name])}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Savings/mo</span>
                  <span className={`font-semibold ${surplus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {fmtL(surplus)}
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, f.savingsRate))}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
                <div className="text-right text-gray-400 dark:text-gray-500">
                  {f.savingsRate.toFixed(1)}% saved
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
