import { useState, useMemo } from 'react';
import { calcCityFinance } from '../utils/taxCalc.js';
import PerRupeeBars from '../components/PerRupeeBars.jsx';
import CityCard from '../components/CityCard.jsx';
import WaterfallChart from '../components/WaterfallChart.jsx';
import DonutExpenses from '../components/DonutExpenses.jsx';
import ExpenseTable from '../components/ExpenseTable.jsx';
import { fmtL } from '../utils/formatters.js';

function findEquivalentCTC(targetSavings, cityExpenses, regime, pct, includePF) {
  // Binary search: find CTC in this city that yields the same monthly savings
  let lo = 100000, hi = 20000000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const f = calcCityFinance(mid, regime, cityExpenses, pct, includePF);
    if (f.monthlySavings < targetSavings) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function EquivalenceBanner({ cityData, expenses, regime, pct, includePF, ctc }) {
  // Use the city with the best (highest) savings as reference
  const sorted = [...cityData].sort((a, b) => b.monthlySavings - a.monthlySavings);
  const ref = sorted[0];
  if (!ref || ref.monthlySavings <= 0) return null;

  const others = sorted.slice(1);
  const equivalents = others.map(c => ({
    name: c.name,
    color: c.color,
    equivCTC: findEquivalentCTC(ref.monthlySavings, expenses[c.name] || {}, regime, pct, includePF),
  }));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl px-5 py-4">
      <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">
        Salary equivalence · matched on monthly savings
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {/* Reference city */}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ref.color }} />
          <span className="font-bold text-gray-900 dark:text-white">{fmtL(ctc)}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">in {ref.name}</span>
        </span>

        {equivalents.map((e, i) => (
          <span key={e.name} className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-gray-600 text-sm">=</span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="font-bold text-gray-900 dark:text-white">{fmtL(e.equivCTC)}</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">in {e.name}</span>
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Each amount delivers the same ₹{Math.round(ref.monthlySavings).toLocaleString('en-IN')}/mo savings as {fmtL(ctc)} in {ref.name}.
      </p>
    </div>
  );
}

export default function Dashboard({ ctc, regime, expenses, cities, updateExpense, settings, viewMode }) {
  const [activeCity, setActiveCity] = useState(cities[0]?.name || null);
  const pct = (settings.basicPct || 40) / 100;

  const cityData = useMemo(() => cities.map(c => ({
    ...c,
    ...calcCityFinance(ctc, regime, expenses[c.name] || {}, pct, settings.includePF),
  })), [ctc, regime, expenses, cities, pct, settings.includePF]);

  const activeData = cityData.find(c => c.name === activeCity);

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Equivalence banner */}
      <EquivalenceBanner
        cityData={cityData}
        expenses={expenses}
        regime={regime}
        pct={pct}
        includePF={settings.includePF}
        ctc={ctc}
      />

      {/* Hero: Per-rupee bars */}
      <PerRupeeBars cityData={cityData} regime={regime} />

      {/* City summary cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">City summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cityData.map(cd => (
            <CityCard
              key={cd.name}
              city={cd.name}
              finance={cd}
              isActive={activeCity === cd.name}
              onClick={() => setActiveCity(cd.name)}
            />
          ))}
        </div>
      </div>

      {/* Active city drill-down */}
      {activeData && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Drill-down — {activeCity}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WaterfallChart finance={activeData} ctc={ctc} />
            <DonutExpenses expenses={expenses[activeCity] || {}} cityName={activeCity} />
          </div>
          <div className="mt-4">
            <ExpenseTable
              cityName={activeCity}
              expenses={expenses[activeCity] || {}}
              monthlyInhand={activeData.monthlyInhand}
              onUpdate={updateExpense}
            />
          </div>
        </div>
      )}
    </div>
  );
}
