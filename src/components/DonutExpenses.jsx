import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { EXPENSE_CATEGORIES } from '../data/defaults.js';
import { fmtINR } from '../utils/formatters.js';

const COLORS = [
  '#378ADD', '#D85A30', '#1D9E75', '#7F77DD', '#BA7517',
  '#D4537E', '#639922', '#888780', '#E24B4A', '#EF9F27',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-medium text-gray-900 dark:text-white">{name}</p>
      <p className="text-gray-500 dark:text-gray-400">{fmtINR(value)}/mo</p>
    </div>
  );
};

export default function DonutExpenses({ expenses, cityName }) {
  const data = EXPENSE_CATEGORIES
    .map((cat, i) => ({ name: cat, value: expenses?.[cat] || 0, color: COLORS[i] }))
    .filter(d => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expense breakdown — {cityName}</h3>
        <p className="text-gray-400 text-sm text-center py-8">Add expenses to see breakdown</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Expense breakdown — {cityName}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
            </div>
            <div className="flex gap-3 text-right">
              <span className="text-gray-900 dark:text-white font-medium">{fmtINR(d.value)}</span>
              <span className="text-gray-400 w-10">{((d.value / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
