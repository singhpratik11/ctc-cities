import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import AddCityModal from './AddCityModal.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/expenses', label: 'Expenses', icon: '₹' },
  { to: '/calculator', label: 'Calculator', icon: '⇔' },
  { to: '/compare', label: 'Compare', icon: '⇌' },
  { to: '/simulator', label: 'Simulator', icon: '⟳' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ cities, onAddCity }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-screen sticky top-0 overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="text-base font-bold text-gray-900 dark:text-white leading-tight">Same CTC</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Four Cities</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Cities list */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Cities</p>
          {cities.map(c => (
            <div key={c.name} className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{c.name}</span>
            </div>
          ))}
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add city
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar — show 4 most-used items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex">
        {NAV.filter(n => n.to !== '/compare').map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            <span className="text-lg leading-none mb-0.5">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {showModal && (
        <AddCityModal cities={cities} onAdd={onAddCity} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
