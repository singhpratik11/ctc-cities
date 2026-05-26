import { calcTax, calcCityFinance } from './taxCalc.js';

const TEST_CTCS = [500000, 800000, 1200000, 2000000, 3500000, 5000000];
const REGIMES = ['new', 'old'];

describe('taxCalc', () => {
  for (const ctc of TEST_CTCS) {
    for (const regime of REGIMES) {
      test(`CTC ₹${(ctc/100000).toFixed(1)}L, ${regime} regime — perRupee sums to 1`, () => {
        const result = calcTax(ctc, regime);
        const { tax, pf, inhand } = result.perRupee;
        expect(Math.abs(tax + pf + inhand - 1)).toBeLessThan(0.0001);
      });

      test(`CTC ₹${(ctc/100000).toFixed(1)}L, ${regime} regime — city perRupee sums to 1`, () => {
        const expenses = {
          Rent: 20000, Groceries: 8000, Transport: 5000, 'Dining out': 6000,
          Utilities: 4000, EMIs: 0, Entertainment: 4000, Healthcare: 2000,
          Subscriptions: 1500, Other: 5000,
        };
        const result = calcCityFinance(ctc, regime, expenses);
        const { tax, pf, expenses: exp, savings } = result.perRupee;
        expect(Math.abs(tax + pf + exp + savings - 1)).toBeLessThan(0.0001);
      });
    }
  }

  test('New regime: no tax for ₹7L or below (after std deduction)', () => {
    // ₹7.75L CTC: taxable = 7.75L - 0.75L = 7L → rebate → 0 tax
    const r = calcTax(775000, 'new');
    expect(r.incomeTax).toBe(0);
  });

  test('New regime: tax > 0 for ₹10L CTC', () => {
    const r = calcTax(1000000, 'new');
    expect(r.incomeTax).toBeGreaterThan(0);
  });

  test('In-hand = CTC - tax - cess - PF', () => {
    const r = calcTax(2000000, 'new');
    expect(Math.abs(r.annualInhand - (r.grossCTC - r.totalTaxBurden - r.pf))).toBeLessThan(1);
  });
});
