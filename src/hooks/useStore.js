import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_EXPENSES, DEFAULT_CITIES, CUSTOM_CITY_COLORS } from '../data/defaults.js';

const KEYS = {
  ctc: 'ctc_tracker_v2_ctc',
  regime: 'ctc_tracker_v2_regime',
  expenses: 'ctc_tracker_v2_expenses',
  cities: 'ctc_tracker_v2_cities',
  settings: 'ctc_tracker_v2_settings',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const defaultSettings = { basicPct: 40, includePF: true, defaultRegime: 'new' };

export function useStore() {
  const [ctc, _setCTC] = useState(() => load(KEYS.ctc, 2000000));
  const [regime, _setRegime] = useState(() => load(KEYS.regime, 'new'));
  const [expenses, _setExpenses] = useState(() => load(KEYS.expenses, DEFAULT_EXPENSES));
  const [cities, _setCities] = useState(() => load(KEYS.cities, DEFAULT_CITIES));
  const [settings, _setSettings] = useState(() => load(KEYS.settings, defaultSettings));
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('ctc_tracker_dark');
    return stored !== null ? JSON.parse(stored) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('ctc_tracker_dark', JSON.stringify(darkMode));
  }, [darkMode]);

  const setCTC = useCallback((val) => {
    _setCTC(val);
    save(KEYS.ctc, val);
  }, []);

  const setRegime = useCallback((val) => {
    _setRegime(val);
    save(KEYS.regime, val);
  }, []);

  const updateExpense = useCallback((city, category, value) => {
    _setExpenses(prev => {
      const next = { ...prev, [city]: { ...prev[city], [category]: Number(value) || 0 } };
      save(KEYS.expenses, next);
      return next;
    });
  }, []);

  const addCity = useCallback((cityData) => {
    _setCities(prev => {
      const usedColors = prev.map(c => c.color);
      const color = cityData.color || CUSTOM_CITY_COLORS.find(c => !usedColors.includes(c)) || CUSTOM_CITY_COLORS[0];
      const newCity = { name: cityData.name, color, isDefault: false };
      const next = [...prev, newCity];
      save(KEYS.cities, next);
      return next;
    });
    _setExpenses(prev => {
      const next = { ...prev, [cityData.name]: cityData.expenses || {} };
      save(KEYS.expenses, next);
      return next;
    });
  }, []);

  const deleteCity = useCallback((cityName) => {
    _setCities(prev => {
      const next = prev.filter(c => c.name !== cityName);
      save(KEYS.cities, next);
      return next;
    });
    _setExpenses(prev => {
      const { [cityName]: _, ...rest } = prev;
      save(KEYS.expenses, rest);
      return rest;
    });
  }, []);

  const updateCity = useCallback((oldName, updates) => {
    _setCities(prev => {
      const next = prev.map(c => c.name === oldName ? { ...c, ...updates } : c);
      save(KEYS.cities, next);
      return next;
    });
    if (updates.name && updates.name !== oldName) {
      _setExpenses(prev => {
        const { [oldName]: cityExp, ...rest } = prev;
        const next = { ...rest, [updates.name]: cityExp };
        save(KEYS.expenses, next);
        return next;
      });
    }
  }, []);

  const reorderCities = useCallback((newOrder) => {
    _setCities(newOrder);
    save(KEYS.cities, newOrder);
  }, []);

  const updateSettings = useCallback((updates) => {
    _setSettings(prev => {
      const next = { ...prev, ...updates };
      save(KEYS.settings, next);
      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    const data = { ctc, regime, expenses, cities, settings, version: 2 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ctc_tracker_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [ctc, regime, expenses, cities, settings]);

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.ctc || !data.regime || !data.expenses || !data.cities) {
            reject(new Error('Invalid export file schema'));
            return;
          }
          setCTC(data.ctc);
          _setRegime(data.regime); save(KEYS.regime, data.regime);
          _setExpenses(data.expenses); save(KEYS.expenses, data.expenses);
          _setCities(data.cities); save(KEYS.cities, data.cities);
          if (data.settings) { _setSettings(data.settings); save(KEYS.settings, data.settings); }
          resolve();
        } catch (err) { reject(err); }
      };
      reader.readAsText(file);
    });
  }, [setCTC]);

  const resetToDefaults = useCallback(() => {
    setCTC(2000000);
    _setRegime('new'); save(KEYS.regime, 'new');
    _setExpenses(DEFAULT_EXPENSES); save(KEYS.expenses, DEFAULT_EXPENSES);
    _setCities(DEFAULT_CITIES); save(KEYS.cities, DEFAULT_CITIES);
    _setSettings(defaultSettings); save(KEYS.settings, defaultSettings);
  }, [setCTC]);

  return {
    ctc, setCTC,
    regime, setRegime,
    expenses, updateExpense,
    cities, addCity, deleteCity, updateCity, reorderCities,
    settings, updateSettings,
    darkMode, setDarkMode,
    exportData, importData, resetToDefaults,
  };
}
