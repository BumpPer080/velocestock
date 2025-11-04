import { useMemo, useState } from 'react';
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  Outlet,
} from 'react-router-dom';
import {
  FiBarChart2,
  FiBox,
  FiActivity,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiUsers,
  FiCamera,
} from 'react-icons/fi';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Reports from './pages/Reports.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProductActivity from './pages/ProductActivity.jsx';
import UserManagement from './pages/UserManagement.jsx';
import Checkout from './pages/Checkout.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: FiBox, end: true },
  { to: '/products', label: 'สินค้า', icon: FiPackage },
  { to: '/reports', label: 'รายงาน', icon: FiBarChart2 },
  { to: '/checkout', label: 'เบิกสินค้า', icon: FiCamera, roles: ['staff'] },
  { to: '/activity', label: 'ประวัติกิจกรรม', icon: FiActivity, roles: ['admin'] },
  { to: '/users', label: 'จัดการผู้ใช้', icon: FiUsers, roles: ['admin'] },
];

function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!item.roles || !item.roles.length) return true;
        if (!user?.role) return false;
        return item.roles.includes(user.role);
      }),
    [user?.role],
  );

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
                {navItems.map((item) => (
                  <li key={item.to}>{renderLink(item)}</li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="navbar-end flex items-center gap-3">
            <div className="hidden text-right uppercase tracking-wide text-secondary-content/80 lg:block">
              <div className="text-[10px]">เข้าสู่ระบบโดย</div>
              <div className="text-xs font-semibold text-secondary-content">
                {user?.displayName || user?.username}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm gap-2 border-secondary border-opacity-40 text-secondary-content hover:border-primary hover:text-primary"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
            >
              <FiLogOut className="text-base" />
              Logout
            </button>
          </div>
        </div>
        <div
          className={`bg-secondary/95 px-4 pb-4 text-secondary-content transition-all duration-300 ease-out lg:hidden ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-widest text-secondary-content/60">
              {user?.displayName || user?.username}
            </div>
            {navItems.map((item) => (
              <div key={item.to}>{renderLink(item)}</div>
            ))}
            <button
              type="button"
              className="btn btn-outline btn-sm gap-2 border-secondary border-opacity-40 text-secondary-content hover:border-primary hover:text-primary"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
            >
              <FiLogOut className="text-base" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-base-300 bg-base-100 py-6 text-sm text-base-content/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} VeloceStock Inventory.</span>
          <span className="uppercase tracking-widest text-primary">Bostech Innovation company limited</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/activity" element={<ProductActivity />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
