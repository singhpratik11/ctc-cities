import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './hooks/useStore.js';
import Sidebar from './components/Sidebar.jsx';
import GlobalControls from './components/GlobalControls.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Compare from './pages/Compare.jsx';
import Simulator from './pages/Simulator.jsx';
import Settings from './pages/Settings.jsx';
import Expenses from './pages/Expenses.jsx';

export default function App() {
  const store = useStore();
  const [viewMode, setViewMode] = useState('Monthly');

  const sharedProps = {
    ctc: store.ctc,
    regime: store.regime,
    expenses: store.expenses,
    cities: store.cities,
    updateExpense: store.updateExpense,
    settings: store.settings,
    viewMode,
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar cities={store.cities} onAddCity={store.addCity} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <GlobalControls
            ctc={store.ctc}
            setCTC={store.setCTC}
            regime={store.regime}
            setRegime={store.setRegime}
            viewMode={viewMode}
            setViewMode={setViewMode}
            darkMode={store.darkMode}
            setDarkMode={store.setDarkMode}
          />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard {...sharedProps} />} />
              <Route path="/expenses" element={
                <Expenses
                  cities={store.cities}
                  expenses={store.expenses}
                  updateExpense={store.updateExpense}
                  ctc={store.ctc}
                  regime={store.regime}
                  settings={store.settings}
                />
              } />
              <Route path="/compare" element={<Compare {...sharedProps} />} />
              <Route path="/simulator" element={
                <Simulator
                  expenses={store.expenses}
                  cities={store.cities}
                  settings={store.settings}
                  regime={store.regime}
                />
              } />
              <Route path="/settings" element={
                <Settings
                  cities={store.cities}
                  addCity={store.addCity}
                  deleteCity={store.deleteCity}
                  updateCity={store.updateCity}
                  reorderCities={store.reorderCities}
                  settings={store.settings}
                  updateSettings={store.updateSettings}
                  expenses={store.expenses}
                  updateExpense={store.updateExpense}
                  exportData={store.exportData}
                  importData={store.importData}
                  resetToDefaults={store.resetToDefaults}
                />
              } />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
