import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { fmtL } from '../utils/formatters.js';

function buildWaterfallData(finance, ctc) {
  const { totalTaxBurden, pf, annualInhand, monthlyExpenses, annualSavings } = finance;
  const annualExpenses = monthlyExpenses * 12;

  const steps = [
    { name: 'Gross CTC', value: ctc, type: 'total' },
    { name: '− Tax', value: -totalTaxBurden, type: 'neg' },
    { name: '− PF', value: -pf, type: 'neg' },
    { name: 'In-hand', value: annualInhand, type: 'total' },
    { name: '− Expenses', value: -annualExpenses, type: 'neg' },
    { name: 'Savings', value: annualSavings, type: annualSavings >= 0 ? 'pos' : 'neg' },
  ];

  let running = 0;
  return steps.map(s => {
    if (s.type === 'total') {
      running = Math.max(s.value, 0);
      return { ...s, base: 0, bar: s.value, pct: ((s.value / ctc) * 100).toFixed(1) };
    }
    const base = s.value < 0 ? running + s.value : running;
    const bar = Math.abs(s.value);
    running = running + s.value;
    return { ...s, base: Math.max(0, base), bar, pct: ((Math.abs(s.value) / ctc) * 100).toFixed(1) };
  });
}

const COLOR_MAP = { total: '#378ADD', neg: '#E24B4A', pos: '#1D9E75' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-medium text-gray-900 dark:text-white">{d?.name}</p>
      <p className="text-gray-600 dark:text-gray-400">{fmtL(d?.value)} ({d?.pct}% of CTC)</p>
    </div>
  );
};

export default function WaterfallChart({ finance, ctc }) {
  if (!finance) return null;
  const data = buildWaterfallData(finance, ctc);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Income breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtL} tick={{ fontSize: 11 }} width={60} />
          <Tooltip content={<CustomTooltip />} />
          {/* invisible base bar to float visible bar */}
          <Bar dataKey="base" stackId="wf" fill="transparent" />
          <Bar dataKey="bar" stackId="wf" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={COLOR_MAP[d.type]} />
            ))}
            <LabelList
              content={({ x, y, width, value, index }) => {
                const d = data[index];
                if (!d) return null;
                return (
                  <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#6b7280">
                    {fmtL(d.value)}
                  </text>
                );
              }}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
