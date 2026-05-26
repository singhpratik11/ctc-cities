import { fmtINR, fmtL } from '../utils/formatters.js';

function SavingsBadge({ rate }) {
  const cls = rate >= 30
    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
    : rate >= 15
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  return (
    <span className={`badge-savings text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {rate.toFixed(1)}% saved
    </span>
  );
}

export default function CityCard({ city, finance, isActive, onClick }) {
  if (!finance) return null;
  const { monthlyInhand, monthlyExpenses, monthlySavings, savingsRate, totalDeductions, color } = finance;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
        isActive
          ? 'border-2 shadow-md dark:shadow-gray-900'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
      style={isActive ? { borderColor: color } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="font-semibold text-gray-900 dark:text-white">{city}</span>
        </div>
        <SavingsBadge rate={savingsRate} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">In-hand/mo</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-white">{fmtL(monthlyInhand)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Expenses/mo</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-white">{fmtL(monthlyExpenses)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Savings/mo</div>
          <div className={`font-semibold text-sm ${monthlySavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {fmtL(monthlySavings)}
          </div>
        </div>
      </div>

      {/* Savings progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(0, Math.min(100, savingsRate))}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500">
        Tax + PF: {fmtL(totalDeductions)}/yr deducted
      </div>
    </button>
  );
}
