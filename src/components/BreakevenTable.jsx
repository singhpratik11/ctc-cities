import { useMemo } from 'react';
import { calcCityFinance } from '../utils/taxCalc.js';
import { fmtL } from '../utils/formatters.js';

function findBreakeven(cityA, cityB, expA, expB, regime, settings) {
  const { basicPct, includePF } = settings;
  const pct = (basicPct || 40) / 100;

  for (let ctcL = 3; ctcL <= 60; ctcL += 0.5) {
    const ctc = ctcL * 100000;
    const fa = calcCityFinance(ctc, regime, expA, pct, includePF);
    const fb = calcCityFinance(ctc, regime, expB, pct, includePF);
    const prevCtc = (ctcL - 0.5) * 100000;
    const prevA = calcCityFinance(prevCtc, regime, expA, pct, includePF);
    const prevB = calcCityFinance(prevCtc, regime, expB, pct, includePF);

    const currDiff = fa.savingsRate - fb.savingsRate;
    const prevDiff = prevA.savingsRate - prevB.savingsRate;

    if (prevDiff * currDiff < 0) {
      return { ctc, direction: currDiff > 0 ? 'A beats B' : 'B beats A' };
    }
  }
  const fa60 = calcCityFinance(6000000, regime, expA, pct, includePF);
  const fb60 = calcCityFinance(6000000, regime, expB, pct, includePF);
  return { ctc: null, winner: fa60.savingsRate >= fb60.savingsRate ? cityA.name : cityB.name };
}

export default function BreakevenTable({ cities, expenses, regime, settings }) {
  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const a = cities[i], b = cities[j];
        const expA = expenses[a.name] || {};
        const expB = expenses[b.name] || {};
        const cross = findBreakeven(a, b, expA, expB, regime, settings);

        if (cross.ctc) {
          const fa = calcCityFinance(cross.ctc, regime, expA, (settings.basicPct || 40) / 100, settings.includePF);
          const fb = calcCityFinance(cross.ctc, regime, expB, (settings.basicPct || 40) / 100, settings.includePF);
          const winner = fa.savingsRate >= fb.savingsRate ? b.name : a.name;
          const loser = winner === a.name ? b.name : a.name;
          result.push({ a: a.name, b: b.name, ctc: cross.ctc, label: `${winner} overtakes ${loser} at ${fmtL(cross.ctc)} CTC` });
        } else {
          result.push({ a: a.name, b: b.name, ctc: null, label: `${cross.winner} always better in this range` });
        }
      }
    }
    return result;
  }, [cities, expenses, regime, settings]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Break-even CTC</h3>
      <div className="space-y-2">
        {pairs.map(({ a, b, label }, i) => (
          <div key={i} className="flex items-start gap-3 text-sm py-1.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
            <span className="text-gray-400 shrink-0 font-mono text-xs pt-0.5">{a} vs {b}</span>
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
