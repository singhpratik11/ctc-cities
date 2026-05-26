export const EXPENSE_CATEGORIES = [
  'Rent', 'Groceries', 'Transport', 'Dining out',
  'Utilities', 'EMIs', 'Entertainment', 'Healthcare',
  'Subscriptions', 'Other',
];

export const DEFAULT_EXPENSES = {
  Delhi: {
    Rent: 28000, Groceries: 8000, Transport: 5000, 'Dining out': 6000,
    Utilities: 4000, EMIs: 0, Entertainment: 4000, Healthcare: 2000,
    Subscriptions: 1500, Other: 5000,
  },
  Mumbai: {
    Rent: 38000, Groceries: 9000, Transport: 4000, 'Dining out': 7000,
    Utilities: 5000, EMIs: 0, Entertainment: 5000, Healthcare: 2500,
    Subscriptions: 1500, Other: 6000,
  },
  Bengaluru: {
    Rent: 32000, Groceries: 8500, Transport: 5500, 'Dining out': 7500,
    Utilities: 4500, EMIs: 0, Entertainment: 5500, Healthcare: 2000,
    Subscriptions: 1500, Other: 6000,
  },
  Hyderabad: {
    Rent: 25000, Groceries: 7500, Transport: 4500, 'Dining out': 6000,
    Utilities: 3800, EMIs: 0, Entertainment: 4500, Healthcare: 1800,
    Subscriptions: 1500, Other: 4500,
  },
};

export const CITY_COLORS = {
  Delhi: '#378ADD',
  Mumbai: '#D85A30',
  Bengaluru: '#1D9E75',
  Hyderabad: '#7F77DD',
};

export const CUSTOM_CITY_COLORS = ['#BA7517', '#D4537E', '#639922', '#888780'];

export const DEFAULT_CITIES = [
  { name: 'Delhi', color: CITY_COLORS.Delhi, isDefault: true },
  { name: 'Mumbai', color: CITY_COLORS.Mumbai, isDefault: true },
  { name: 'Bengaluru', color: CITY_COLORS.Bengaluru, isDefault: true },
  { name: 'Hyderabad', color: CITY_COLORS.Hyderabad, isDefault: true },
];

export const SEGMENT_COLORS = {
  tax: '#E24B4A',
  pf: '#EF9F27',
  expenses: '#64748b',
  savings: '#1D9E75',
};
