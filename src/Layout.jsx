import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import CopyBadge from './components/CopyBadge';
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  Ticket,
  BookOpen,
  LogOut,
  Building2,
  User,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: true },
  { to: '/tickets', label: 'Tickets', icon: Ticket, disabled: false },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, disabled: true },
  { to: '/billing', label: 'Billing', icon: CreditCard, disabled: false },
  { to: '/organization', label: 'Organization', icon: Settings, disabled: true },
  { to: '/users', label: 'Users', icon: Users, disabled: false },
];

export default function Layout() {
  const { user, organization, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside
        style={{
          width: '280px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-primary)',
          background: 'var(--bg-surface-alt)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <img
            src="https://support-hub.io/assets/img/logo_text.svg"
            alt="SupportHub"
            style={{
              height: '22px',
              display: 'block'
            }}
          />
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={14} style={{ color: 'var(--fg-muted)' }} />
            <span className="text-meta">Workspace</span>
          </div>
          <p className="text-title" style={{ fontSize: '15px', marginBottom: '8px' }}>
            {organization?.name}
          </p>
          <CopyBadge value={organization?.id} compact />
        </div>

        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <div style={{ padding: '0 8px', marginBottom: '8px' }}>
            <span className="text-meta" style={{ fontSize: '12px' }}>Menu</span>
          </div>

          {NAV_ITEMS.map((item) => {
            // Role-based visibility logic
            const isManager = user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'SUPPORT_HUB_ADMINISTRATOR' || user?.role === 'SYSTEM';
            const adminRoutes = ['/users', '/billing', '/organization'];
            if (!isManager && adminRoutes.includes(item.to)) {
              return null; // Hide admin routes for normal employees/operators
            }

            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.disabled ? '#' : item.to}
                className={`nav-item ${isActive ? 'nav-item--active' : ''} ${item.disabled ? 'nav-item--disabled' : ''}`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.disabled && (
                  <span className="status-dot status-dot--offline" style={{ marginLeft: 'auto' }} />
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isSettingsOpen && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-primary)' }}>
              <button
                onClick={toggleTheme}
                className="btn-minimal btn-minimal--secondary"
                style={{ flex: 1, padding: '8px' }}
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span style={{ fontSize: '12px', marginLeft: '6px' }}>Theme</span>
              </button>

              <button
                onClick={toggleLanguage}
                className="btn-minimal btn-minimal--secondary"
                style={{ flex: 1, padding: '8px' }}
                title="Toggle language"
              >
                <Globe size={14} />
                <span style={{ fontSize: '12px', marginLeft: '6px', fontWeight: 600 }}>
                  {language.toUpperCase()}
                </span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="btn-minimal btn-minimal--ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px' }}
          >
            <Settings size={16} />
            <span style={{ flex: 1, textAlign: 'left' }}>Preferences</span>
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-primary)', padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <User size={14} style={{ color: 'var(--fg-muted)' }} />
              <span className="text-meta">Session</span>
            </div>
            <p className="text-title" style={{ fontSize: '14px', marginBottom: '2px' }}>
              {user?.fullName}
            </p>
            <p className="text-meta" style={{ fontSize: '13px', marginBottom: '8px' }}>
              {user?.email}
            </p>
            <CopyBadge value={user?.id} compact />
          </div>

          <button
            onClick={logout}
            className="btn-minimal btn-minimal--ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 0' }}
          >
            <LogOut size={16} style={{ color: 'var(--fg-muted)' }} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '280px', minHeight: '100vh' }}>
        <header style={{
          height: '65px',
          borderBottom: '1px solid var(--border-primary)',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <h2 className="text-title" style={{ fontSize: '16px' }}>
            {location.pathname.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Home'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot" />
            <span className="text-meta" style={{ fontSize: '13px' }}>System Operational</span>
          </div>
        </header>

        <div className="animate-entry" style={{ padding: '48px 40px', maxWidth: '1000px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
