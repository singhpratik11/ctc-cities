import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, ReferenceLine, Label,
} from 'recharts';
import { calcCityFinance } from '../utils/taxCalc.js';
import { fmtINR, fmtL, fmtComma, parseComma } from '../utils/formatters.js';
import { EXPENSE_CATEGORIES } from '../data/defaults.js';

const ROW_LABELS = [
  { key: 'grossCTC', label: 'Gross CTC', fmt: fmtL },
  { key: 'standardDeduction', label: 'Standard deduction', fmt: fmtL },
  { key: 'taxableIncome', label: 'Taxable income', fmt: fmtL },
  { key: 'incomeTax', label: 'Income tax', fmt: fmtL },
  { key: 'cess', label: 'Health & Ed cess', fmt: fmtL },
  { key: 'pf', label: 'PF (employee)', fmt: fmtL },
  { key: 'annualInhand', label: 'Annual in-hand', fmt: fmtL },
  { key: 'monthlyInhand', label: 'Monthly in-hand', fmt: fmtINR },
  ...EXPENSE_CATEGORIES.map(c => ({ key: `exp_${c}`, label: c, fmt: fmtINR, isExpense: true, cat: c })),
  { key: 'monthlyExpenses', label: 'Total monthly expenses', fmt: fmtINR, bold: true },
  { key: 'monthlySavings', label: 'Monthly savings', fmt: fmtINR, bold: true },
  { key: 'annualSavings', label: 'Annual savings', fmt: fmtL, bold: true },
  { key: 'savingsRate', label: 'Savings rate %', fmt: v => `${v.toFixed(1)}%`, bold: true },
  { key: 'perRupeeSavings', label: 'Paise saved per ₹1', fmt: v => `${Math.round(v * 100)}p`, bold: true, highlight: true },
];

function getVal(row, finance, expenses) {
  if (row.isExpense) return expenses?.[row.cat] || 0;
  if (row.key === 'perRupeeSavings') return finance?.perRupee?.savings || 0;
  return finance?.[row.key] ?? 0;
}

export default function Compare({ ctc, regime, expenses, cities, updateExpense, settings, viewMode }) {
  const mult = viewMode === 'Annual' ? 12 : 1;
  const pct = (settings.basicPct || 40) / 100;
  const [editingCell, setEditingCell] = useState(null);

  const cityFinance = useMemo(() => {
    return Object.fromEntries(cities.map(c => [
      c.name,
      calcCityFinance(ctc, regime, expenses[c.name] || {}, pct, settings.includePF),
    ]));
  }, [ctc, regime, expenses, cities, pct, settings.includePF]);

  // For each row, find best/worst values
  const rowMinMax = useMemo(() => {
    return Object.fromEntries(ROW_LABELS.map(row => {
      const vals = cities.map(c => getVal(row, cityFinance[c.name], expenses[c.name]));
      return [row.key, { min: Math.min(...vals), max: Math.max(...vals) }];
    }));
  }, [cities, cityFinance, expenses]);

  // CoL index for scatter
  const minExp = Math.min(...cities.map(c => cityFinance[c.name]?.monthlyExpenses || Infinity));
  const scatterData = cities.map(c => ({
    name: c.name,
    color: c.color,
    x: minExp > 0 ? ((cityFinance[c.name]?.monthlyExpenses || 0) / minExp) * 100 : 100,
    y: cityFinance[c.name]?.savingsRate || 0,
  }));

  // Bar chart data
  const barData = cities.map(c => {
    const f = cityFinance[c.name];
    return {
      name: c.name,
      'In-hand': viewMode === 'Annual' ? f?.annualInhand || 0 : f?.monthlyInhand || 0,
      'Expenses': viewMode === 'Annual' ? (f?.monthlyExpenses || 0) * 12 : f?.monthlyExpenses || 0,
      'Savings': viewMode === 'Annual' ? f?.annualSavings || 0 : f?.monthlySavings || 0,
    };
  });

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Comparison table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 w-48 z-10">
                Metric
              </th>
              {cities.map(c => (
                <th key={c.name} className="px-4 py-3 text-center min-w-32">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map(row => {
              const { min, max } = rowMinMax[row.key] || {};
              const isLowerBetter = ['incomeTax', 'totalTaxBurden', 'monthlyExpenses'].includes(row.key) || row.isExpense;
              return (
                <tr key={row.key} className={`border-b border-gray-50 dark:border-gray-800/50 ${row.highlight ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                  <td className={`sticky left-0 bg-white dark:bg-gray-900 px-4 py-2 text-gray-600 dark:text-gray-400 z-10 ${row.bold ? 'font-semibold' : ''}`}>
                    {row.label}
                  </td>
                  {cities.map(c => {
                    const raw = getVal(row, cityFinance[c.name], expenses[c.name]);
                    const isBest = isLowerBetter ? raw === min : raw === max;
                    const isWorst = isLowerBetter ? raw === max : raw === min;
                    const cellKey = `${c.name}_${row.key}`;
                    const isEditing = editingCell === cellKey;

                    if (row.isExpense) {
                      return (
                        <td key={c.name} className={`px-4 py-1 text-center ${isBest ? 'bg-green-50 dark:bg-green-950/30' : isWorst ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                          <input
                            className="w-24 text-center bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-400 outline-none text-gray-900 dark:text-white"
                            value={isEditing ? undefined : fmtComma(raw)}
                            defaultValue={fmtComma(raw)}
                            onFocus={() => setEditingCell(cellKey)}
                            onBlur={e => {
                              updateExpense(c.name, row.cat, parseComma(e.target.value));
                              setEditingCell(null);
                            }}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={c.name} className={`px-4 py-2 text-center ${row.bold ? 'font-semibold' : ''} ${isBest ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : isWorst ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {row.fmt(raw)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grouped bar chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">In-hand vs Expenses vs Savings ({viewMode})</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmtL} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmtL(v)} />
            <Legend />
            <Bar dataKey="In-hand" fill="#378ADD" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Expenses" fill="#64748b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Savings" fill="#1D9E75" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Cost of living vs Savings rate</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">CoL index: cheapest city = 100. Quadrants at CoL=125 and savings=25%.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" dataKey="x" name="CoL Index" domain={[80, 'auto']} tick={{ fontSize: 11 }}>
              <Label value="CoL Index" position="bottom" offset={-5} fontSize={11} />
            </XAxis>
            <YAxis type="number" dataKey="y" name="Savings Rate %" tick={{ fontSize: 11 }}>
              <Label value="Savings %" angle={-90} position="left" offset={10} fontSize={11} />
            </YAxis>
            <ReferenceLine x={125} stroke="#94a3b8" strokeDasharray="4 4" />
            <ReferenceLine y={25} stroke="#94a3b8" strokeDasharray="4 4" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
                    <p className="font-medium" style={{ color: d.color }}>{d.name}</p>
                    <p className="text-gray-500">CoL index: {d.x.toFixed(0)}</p>
                    <p className="text-gray-500">Savings: {d.y.toFixed(1)}%</p>
                  </div>
                );
              }}
            />
            <Scatter
              data={scatterData}
              shape={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={10} fill={payload.color} fillOpacity={0.85} />
                    <text x={cx} y={cy - 14} textAnchor="middle" fontSize={11} fill={payload.color} fontWeight={600}>
                      {payload.name}
                    </text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
          <div className="text-green-600 dark:text-green-400 font-medium">↙ Sweet spot (low CoL, high savings)</div>
          <div className="text-right">↗ Expensive but worth it</div>
          <div>↙ Cheap but low savings</div>
          <div className="text-right text-red-400">↗ Expensive and low savings</div>
        </div>
      </div>
    </div>
  );
}
