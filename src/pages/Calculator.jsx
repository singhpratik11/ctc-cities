import { useState, useMemo } from 'react';
import { calcCityFinance } from '../utils/taxCalc.js';
import { fmtL, fmtINR, fmtComma, parseComma } from '../utils/formatters.js';

function findEquivalentCTC(targetSavings, cityExpenses, regime, pct, includePF) {
  let lo = 100000, hi = 30000000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const f = calcCityFinance(mid, regime, cityExpenses, pct, includePF);
    if (f.monthlySavings < targetSavings) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function CityResultCard({ city, equivCTC, sourceCTC, isSource, finance, diffPct }) {
  const sign = diffPct >= 0 ? '+' : '';
  return (
    <div className={`rounded-xl border p-5 transition-all ${
      isSource
        ? 'border-2 bg-white dark:bg-gray-900'
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
    }`}
      style={isSource ? { borderColor: city.color } : {}}
    >
      {/* City header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: city.color }} />
          <span className="font-semibold text-gray-900 dark:text-white">{city.name}</span>
          {isSource && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
              source
            </span>
          )}
        </div>
        {!isSource && (
          <span className={`text-sm font-semibold ${diffPct > 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
            {sign}{diffPct.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Equivalent CTC — hero number */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{fmtL(equivCTC)}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {isSource ? 'your CTC' : `needed to match savings`}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monthly savings</span>
          <span className="font-medium text-green-600 dark:text-green-400">{fmtINR(finance.monthlySavings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Savings rate</span>
          <span className="font-medium text-gray-900 dark:text-white">{finance.savingsRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monthly in-hand</span>
          <span className="font-medium text-gray-900 dark:text-white">{fmtL(finance.monthlyInhand)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monthly expenses</span>
          <span className="font-medium text-gray-900 dark:text-white">{fmtINR(finance.monthlyExpenses)}</span>
        </div>
      </div>

      {/* Savings bar */}
      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, finance.savingsRate))}%`, backgroundColor: city.color }}
        />
      </div>
    </div>
  );
}

export default function Calculator({ cities, expenses, settings }) {
  const pct = (settings.basicPct || 40) / 100;

  const [inputCTC, setInputCTC] = useState('20,00,000');
  const [focused, setFocused] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [sourceCityName, setSourceCityName] = useState(cities[0]?.name || '');
  const [regime, setRegime] = useState(settings.defaultRegime || 'new');

  const ctc = parseComma(inputCTC);
  const sourceCity = cities.find(c => c.name === sourceCityName) || cities[0];

  const sourceFinance = useMemo(() =>
    calcCityFinance(ctc, regime, expenses[sourceCity?.name] || {}, pct, settings.includePF),
    [ctc, regime, sourceCity, expenses, pct, settings.includePF]
  );

  const results = useMemo(() => {
    if (!sourceCity || ctc <= 0) return [];
    const targetSavings = sourceFinance.monthlySavings;

    return cities.map(c => {
      const isSource = c.name === sourceCity.name;
      const equivCTC = isSource ? ctc : findEquivalentCTC(targetSavings, expenses[c.name] || {}, regime, pct, settings.includePF);
      const finance = isSource ? sourceFinance : calcCityFinance(equivCTC, regime, expenses[c.name] || {}, pct, settings.includePF);
      const diffPct = ((equivCTC - ctc) / ctc) * 100;
      return { city: c, equivCTC, isSource, finance, diffPct };
    });
  }, [ctc, regime, sourceCity, cities, expenses, pct, settings.includePF, sourceFinance]);

  return (
    <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CTC Equivalent Calculator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter a CTC and city — see what you'd need to earn elsewhere to save the same amount.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* CTC */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Your CTC
            </label>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 focus-within:border-blue-400 dark:focus-within:border-blue-500">
              <span className="px-3 py-2.5 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-200 dark:border-gray-700">₹</span>
              <input
                className="flex-1 px-3 py-2.5 text-gray-900 dark:text-white bg-transparent outline-none text-sm"
                value={focused ? rawInput : inputCTC}
                onFocus={() => { setFocused(true); setRawInput(String(ctc)); }}
                onBlur={e => {
                  const val = parseComma(e.target.value);
                  if (val > 0) setInputCTC(fmtComma(val));
                  setFocused(false);
                }}
                onChange={e => setRawInput(e.target.value)}
                placeholder="20,00,000"
              />
            </div>
          </div>

          {/* Source city */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Your city
            </label>
            <select
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500"
              value={sourceCityName}
              onChange={e => setSourceCityName(e.target.value)}
            >
              {cities.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Regime */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Tax regime
            </label>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
              {['new', 'old'].map(r => (
                <button
                  key={r}
                  onClick={() => setRegime(r)}
                  className={`px-4 py-2.5 capitalize transition-colors ${
                    regime === r
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary line */}
        {ctc > 0 && sourceCity && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
            In <span className="font-medium text-gray-900 dark:text-white">{sourceCity.name}</span> on{' '}
            <span className="font-medium text-gray-900 dark:text-white">{fmtL(ctc)}</span>, you save{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">{fmtINR(sourceFinance.monthlySavings)}/mo</span>
            {' '}({sourceFinance.savingsRate.toFixed(1)}% of in-hand).
            Below is what you'd need to earn in each other city to match that.
          </div>
        )}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map(({ city, equivCTC, isSource, finance, diffPct }) => (
          <CityResultCard
            key={city.name}
            city={city}
            equivCTC={equivCTC}
            sourceCTC={ctc}
            isSource={isSource}
            finance={finance}
            diffPct={diffPct}
          />
        ))}
      </div>

      {/* Insight footer */}
      {results.length > 1 && ctc > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 <span className="font-medium text-gray-700 dark:text-gray-300">
              {(() => {
                const cheapest = results.filter(r => !r.isSource).sort((a, b) => a.equivCTC - b.equivCTC)[0];
                const priciest = results.filter(r => !r.isSource).sort((a, b) => b.equivCTC - a.equivCTC)[0];
                if (!cheapest || !priciest) return null;
                return `${cheapest.city.name} is the easiest match — you'd need ${fmtL(cheapest.equivCTC)} there. ${priciest.city.name} is the hardest — it takes ${fmtL(priciest.equivCTC)} to replicate your ${sourceCity.name} savings.`;
              })()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
