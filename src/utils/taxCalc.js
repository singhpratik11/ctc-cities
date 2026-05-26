/**
 * Tax engine for FY 2025-26
 * Takes (ctc, regime) → full breakdown object
 * Takes (ctc, regime, monthlyExpenses) → city-extended breakdown
 */

function newRegimeTax(taxableIncome) {
  let tax = 0;
  const slabs = [
    [300000, 0],
    [700000, 0.05],
    [1000000, 0.10],
    [1200000, 0.15],
    [1500000, 0.20],
    [Infinity, 0.30],
  ];
  let prev = 0;
  for (const [upper, rate] of slabs) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, upper) - prev;
    tax += taxable * rate;
    prev = upper;
  }
  return tax;
}

function oldRegimeTax(taxableIncome) {
  let tax = 0;
  const slabs = [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.20],
    [Infinity, 0.30],
  ];
  let prev = 0;
  for (const [upper, rate] of slabs) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, upper) - prev;
    tax += taxable * rate;
    prev = upper;
  }
  return tax;
}

export function calcTax(ctc, regime = 'new', basicPct = 0.4, includePF = true) {
  const basic = ctc * basicPct;
  const pf = includePF ? basic * 0.12 : 0;

  let taxableIncome, incomeTax;

  if (regime === 'new') {
    const stdDeduction = 75000;
    taxableIncome = Math.max(0, ctc - stdDeduction);
    const rawTax = newRegimeTax(taxableIncome);
    // Rebate u/s 87A: if taxable income ≤ 7L, tax = 0
    incomeTax = taxableIncome <= 700000 ? 0 : rawTax;
  } else {
    // Old regime: PF deducted before computing taxable income (80C, capped at 1.5L)
    const stdDeduction = 50000;
    const pfDeduction = Math.min(pf, 150000);
    taxableIncome = Math.max(0, ctc - stdDeduction - pfDeduction);
    const rawTax = oldRegimeTax(taxableIncome);
    // Rebate u/s 87A: if taxable income ≤ 5L, tax = 0
    incomeTax = taxableIncome <= 500000 ? 0 : rawTax;
  }

  const cess = incomeTax * 0.04;
  const totalTaxBurden = incomeTax + cess;

  // In new regime: PF deducted post-tax from in-hand
  // In old regime: PF already deducted from taxable income, still deducted from in-hand
  const annualInhand = ctc - totalTaxBurden - pf;
  const monthlyInhand = annualInhand / 12;

  const perRupee = {
    tax: ctc > 0 ? totalTaxBurden / ctc : 0,
    pf: ctc > 0 ? pf / ctc : 0,
    inhand: ctc > 0 ? annualInhand / ctc : 0,
  };

  return {
    grossCTC: ctc,
    basic,
    pf,
    standardDeduction: regime === 'new' ? 75000 : 50000,
    taxableIncome,
    incomeTax,
    cess,
    totalTaxBurden,
    totalDeductions: totalTaxBurden + pf,
    annualInhand,
    monthlyInhand,
    perRupee,
  };
}

export function calcCityFinance(ctc, regime = 'new', cityExpenses = {}, basicPct = 0.4, includePF = true) {
  const base = calcTax(ctc, regime, basicPct, includePF);
  const monthlyExpenses = Object.values(cityExpenses).reduce((s, v) => s + (Number(v) || 0), 0);
  const monthlySavings = base.monthlyInhand - monthlyExpenses;
  const annualSavings = monthlySavings * 12;
  const savingsRate = base.monthlyInhand > 0 ? (monthlySavings / base.monthlyInhand) * 100 : 0;

  const monthlyIncome = ctc / 12;
  const perRupee = {
    tax: base.perRupee.tax,
    pf: base.perRupee.pf,
    expenses: monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 0,
    savings: monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0,
  };

  return {
    ...base,
    monthlyExpenses,
    monthlySavings,
    annualSavings,
    savingsRate,
    perRupee,
  };
}
