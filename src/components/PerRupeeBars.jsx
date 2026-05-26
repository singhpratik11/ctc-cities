import { SEGMENT_COLORS } from '../data/defaults.js';
import { fmtPaise } from '../utils/formatters.js';

function Segment({ fraction, color, label, showLabel }) {
  const pct = Math.max(0, Math.min(100, fraction * 100));
  return (
    <div
      className="per-rupee-segment relative flex items-center justify-center overflow-hidden"
      style={{ width: `${pct}%`, backgroundColor: color, minWidth: pct > 0 ? 2 : 0 }}
      title={`${label}: ${Math.round(pct)}p`}
    >
      {showLabel && pct > 6 && (
        <span className="text-white text-xs font-semibold px-1 whitespace-nowrap select-none">
          {Math.round(pct)}p
        </span>
      )}
    </div>
  );
}

export default function PerRupeeBars({ cityData, regime }) {
  const sorted = [...cityData].sort((a, b) => (b.perRupee?.savings || 0) - (a.perRupee?.savings || 0));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">For every ₹1 you earn…</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Cities sorted by savings. Tax calculated under {regime === 'new' ? 'New' : 'Old'} regime.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs">
        {[
          { key: 'tax', label: 'Tax' },
          { key: 'pf', label: 'PF' },
          { key: 'expenses', label: 'Expenses' },
          { key: 'savings', label: 'Savings' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS[key] }} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {sorted.map(({ name, color, perRupee }) => {
          const { tax = 0, pf = 0, expenses = 0, savings = 0 } = perRupee || {};
          const savingsPaise = Math.round(savings * 100);
          return (
            <div key={name} className="flex items-center gap-4">
              <div className="w-24 shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                {name}
              </div>
              <div className="flex-1 h-8 flex rounded overflow-hidden">
                <Segment fraction={tax} color={SEGMENT_COLORS.tax} label="Tax" showLabel />
                <Segment fraction={pf} color={SEGMENT_COLORS.pf} label="PF" showLabel />
                <Segment fraction={expenses} color={SEGMENT_COLORS.expenses} label="Expenses" showLabel />
                <Segment fraction={savings > 0 ? savings : 0} color={SEGMENT_COLORS.savings} label="Savings" showLabel />
              </div>
              <div className="w-36 shrink-0 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  You keep {savingsPaise}p
                </span>{' '}
                in {name}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="text-gray-400 text-center py-8">No city data available.</p>
      )}
    </div>
  );
}
