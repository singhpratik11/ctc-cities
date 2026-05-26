import { useState, useRef } from 'react';
import AddCityModal from '../components/AddCityModal.jsx';
import { EXPENSE_CATEGORIES } from '../data/defaults.js';
import { fmtComma, parseComma } from '../utils/formatters.js';

export default function Settings({
  cities, addCity, deleteCity, updateCity, reorderCities,
  settings, updateSettings,
  expenses, updateExpense,
  exportData, importData, resetToDefaults,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [confirmDeleteCity, setConfirmDeleteCity] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState('');
  const [importOk, setImportOk] = useState(false);
  const fileRef = useRef();

  const dragSrc = useRef(null);

  const onDragStart = (i) => { dragSrc.current = i; };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (i) => {
    if (dragSrc.current === null || dragSrc.current === i) return;
    const reordered = Array.from(cities);
    const [moved] = reordered.splice(dragSrc.current, 1);
    reordered.splice(i, 0, moved);
    reorderCities(reordered);
    dragSrc.current = null;
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setImportOk(true);
      setImportError('');
      setTimeout(() => setImportOk(false), 3000);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6 max-w-2xl">
      {/* Tax & calculation */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Tax & calculation</h2>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 dark:text-gray-300">Default tax regime</label>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
            {['new', 'old'].map(r => (
              <button key={r} onClick={() => updateSettings({ defaultRegime: r })}
                className={`px-3 py-1.5 capitalize ${settings.defaultRegime === r ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Basic salary % of CTC</label>
            <p className="text-xs text-gray-400 mt-0.5">Default: 40%</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range" min={30} max={60} step={5}
              value={settings.basicPct || 40}
              onChange={e => updateSettings({ basicPct: Number(e.target.value) })}
              className="w-28 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">
              {settings.basicPct || 40}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 dark:text-gray-300">Include PF deduction</label>
          <button
            onClick={() => updateSettings({ includePF: !settings.includePF })}
            className={`w-11 h-6 rounded-full transition-colors ${settings.includePF ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settings.includePF ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Cities */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Cities</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add city
          </button>
        </div>

        <div className="space-y-2">
          {cities.map((city, i) => (
            <div
              key={city.name}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="text-gray-400 cursor-grab text-lg leading-none select-none">⠿</div>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: city.color }} />
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{city.name}</span>
              {city.isDefault ? (
                <span className="text-xs text-gray-400" title="Default city — cannot be deleted">🔒</span>
              ) : confirmDeleteCity === city.name ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500 dark:text-red-400">Delete {city.name}?</span>
                  <button
                    onClick={() => { deleteCity(city.name); setConfirmDeleteCity(null); }}
                    className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                  >Yes</button>
                  <button
                    onClick={() => setConfirmDeleteCity(null)}
                    className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                  >Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCity(city.name)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                    title="Edit"
                  >✏️</button>
                  <button
                    onClick={() => setConfirmDeleteCity(city.name)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                    title="Delete"
                  >🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Edit city expenses */}
      {editingCity && (
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Edit — {editingCity}</h2>
            <button onClick={() => setEditingCity(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-2">
            {EXPENSE_CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 w-32">{cat}</label>
                <input
                  className="w-32 text-right border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none focus:border-blue-400"
                  defaultValue={fmtComma(expenses[editingCity]?.[cat] || 0)}
                  onBlur={e => updateExpense(editingCity, cat, parseComma(e.target.value))}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Data */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">Data</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Export JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Reset to defaults
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-red-600 dark:text-red-400">Are you sure? This clears all data.</span>
              <button onClick={() => { resetToDefaults(); setConfirmReset(false); }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Yes, reset</button>
              <button onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
            </div>
          )}
        </div>
        {importError && <p className="text-sm text-red-500">{importError}</p>}
        {importOk && <p className="text-sm text-green-600 dark:text-green-400">Data imported successfully.</p>}
      </section>

      {showAddModal && (
        <AddCityModal cities={cities} onAdd={addCity} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
