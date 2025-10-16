import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { FiBarChart2, FiBox, FiMenu, FiPackage } from 'react-icons/fi';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Reports from './pages/Reports.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: FiBox, end: true },
  { to: '/products', label: 'Products', icon: FiPackage },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderLink = ({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'btn btn-ghost btn-sm justify-start gap-3 rounded-full px-4 font-semibold uppercase tracking-wide transition-all',
          isActive
            ? 'bg-primary/20 text-primary shadow-sm'
            : 'text-secondary-content/80 hover:bg-primary/10 hover:text-primary',
        ].join(' ')
      }
      onClick={() => setIsMenuOpen(false)}
    >
      <Icon className="text-lg" />
      {label}
    </NavLink>
  );

  return (
    <div data-theme="velocestock" className="min-h-screen bg-base-200 text-base-content">
      <header className="sticky top-0 z-30 bg-secondary/95 text-secondary-content shadow-lg shadow-secondary/30 backdrop-blur">
        <div className="navbar mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="navbar-start">
            <button
              type="button"
              className="btn btn-ghost btn-circle text-primary focus:outline-none lg:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <FiMenu className="text-xl" />
            </button>
            <NavLink to="/" className="btn btn-ghost text-left normal-case">
              <span className="text-2xl font-black text-primary">Veloce</span>
              <span className="text-2xl font-black text-secondary-content">Stock</span>
            </NavLink>
          </div>
          <div className="navbar-center hidden lg:flex">
            <nav>
              <ul className="menu menu-horizontal gap-2 text-sm">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>{renderLink(item)}</li>
                ))}
              </ul>
            </nav>
          </div>
          {/* <div className="navbar-end">
            <div className="rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Orange &amp; Black Crew
            </div>
          </div> */}
        </div>
        <div
          className={`bg-secondary/95 px-4 pb-4 text-secondary-content transition-all duration-300 ease-out lg:hidden ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <div key={item.to}>{renderLink(item)}</div>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
      <footer className="border-t border-base-300 bg-base-100 py-6 text-sm text-base-content/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} VeloceStock Inventory .</span>
          <span className="uppercase tracking-widest text-primary">Bostech Innovation company limited</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
