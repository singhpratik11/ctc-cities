import { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { calcCityFinance } from '../utils/taxCalc.js';
import { fmtL, fmtINR } from '../utils/formatters.js';
import PerRupeeBars from '../components/PerRupeeBars.jsx';
import CityCard from '../components/CityCard.jsx';
import BreakevenTable from '../components/BreakevenTable.jsx';

const CTC_MIN = 300000;
const CTC_MAX = 6000000;
const CTC_STEP = 50000;
const CHART_POINTS = 115;

function Slider({ label, value, min, max, step, fmt, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

export default function Simulator({ expenses: baseExpenses, cities, settings, regime }) {
  const [simCTC, setSimCTC] = useState(2000000);
  const [rentMult, setRentMult] = useState(1.0);
  const [lifeMult, setLifeMult] = useState(1.0);
  const pct = (settings.basicPct || 40) / 100;

  const scaleExpenses = useCallback((cityName) => {
    const raw = baseExpenses[cityName] || {};
    return Object.fromEntries(
      Object.entries(raw).map(([cat, val]) => [
        cat,
        cat === 'Rent' ? val * rentMult : val * lifeMult,
      ])
    );
  }, [baseExpenses, rentMult, lifeMult]);

  const cityData = useMemo(() => cities.map(c => ({
    ...c,
    ...calcCityFinance(simCTC, regime, scaleExpenses(c.name), pct, settings.includePF),
  })), [simCTC, regime, cities, scaleExpenses, pct, settings.includePF]);

  // Pre-compute savings rate curve — 115 points
  const chartData = useMemo(() => {
    const step = (CTC_MAX - CTC_MIN) / (CHART_POINTS - 1);
    return Array.from({ length: CHART_POINTS }, (_, i) => {
      const ctc = Math.round(CTC_MIN + i * step);
      const point = { ctc };
      cities.forEach(c => {
        const f = calcCityFinance(ctc, regime, scaleExpenses(c.name), pct, settings.includePF);
        point[c.name] = parseFloat(f.savingsRate.toFixed(2));
      });
      return point;
    });
  }, [cities, regime, scaleExpenses, pct, settings.includePF]);

  const scaledExpenses = useMemo(() =>
    Object.fromEntries(cities.map(c => [c.name, scaleExpenses(c.name)])),
    [cities, scaleExpenses]
  );

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Sliders */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">Simulator controls</h2>
        <Slider label="CTC" value={simCTC} min={CTC_MIN} max={CTC_MAX} step={CTC_STEP} fmt={fmtL} onChange={setSimCTC} />
        <Slider label="Rent multiplier (all cities)" value={rentMult} min={0.5} max={2.5} step={0.1} fmt={v => `${v.toFixed(1)}x`} onChange={setRentMult} />
        <Slider label="Lifestyle multiplier (non-rent)" value={lifeMult} min={0.5} max={2.0} step={0.1} fmt={v => `${v.toFixed(1)}x`} onChange={setLifeMult} />
      </div>

      {/* Per-rupee bars (live) */}
      <PerRupeeBars cityData={cityData} regime={regime} />

      {/* City cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cityData.map(cd => (
          <CityCard key={cd.name} city={cd.name} finance={cd} isActive={false} onClick={() => {}} />
        ))}
      </div>

      {/* Savings rate line chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Savings rate vs CTC</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <XAxis dataKey="ctc" tickFormatter={fmtL} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={v => `CTC: ${fmtL(v)}`}
              formatter={(v, name) => [`${v.toFixed(1)}%`, name]}
            />
            <Legend />
            <ReferenceLine x={simCTC} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Current', fontSize: 11 }} />
            {cities.map(c => (
              <Line
                key={c.name}
                type="monotone"
                dataKey={c.name}
                stroke={c.color}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Break-even table */}
      <BreakevenTable cities={cities} expenses={scaledExpenses} regime={regime} settings={settings} />
    </div>
  );
}
