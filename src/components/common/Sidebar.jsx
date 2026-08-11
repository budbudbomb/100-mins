import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useIntl } from 'react-intl';
import {
  FileText, Search, Phone, ClipboardList, AlertTriangle,
  Map, LayoutDashboard, BarChart3, Compass, Shield,
  ChevronLeft, ChevronRight, User, Headphones,
  Crown, Settings, HelpCircle, Zap
} from 'lucide-react';

/* ── Role-specific nav config ── */
const SIDEBAR_NAV = {
  complainant: {
    sections: [
      {
        title: null,
        items: [
          { path: '/submit', icon: FileText, labelId: 'nav.submit', badge: null },
          { path: '/track', icon: Search, labelId: 'nav.track', badge: null },
        ],
      },
    ],
  },
  callReceiver: {
    sections: [
      {
        title: 'Queue',
        items: [
          { path: '/receiver/queue', icon: ClipboardList, labelId: 'nav.review', badgeKey: 'pending' },
          { path: '/receiver/log', icon: Phone, labelId: 'nav.logCall', badge: null },
        ],
      },
    ],
  },
  flyingSquad: {
    sections: [
      {
        title: 'Operations',
        items: [
          { path: '/squad/alerts', icon: AlertTriangle, labelId: 'nav.alerts', badgeKey: 'active' },
          { path: '/squad/map', icon: Compass, labelId: 'nav.map', badge: null },
        ],
      },
    ],
  },
  admin: {
    sections: [
      {
        title: 'Overview',
        items: [
          { path: '/admin/dashboard', icon: LayoutDashboard, labelId: 'nav.dashboard', badge: null },
          { path: '/admin/map', icon: Map, labelId: 'nav.map', badge: null },
        ],
      },
      {
        title: 'Management',
        items: [
          { path: '/admin/complaints', icon: ClipboardList, labelId: 'nav.complaints', badge: null },
          { path: '/admin/analytics', icon: BarChart3, labelId: 'nav.analytics', badge: null },
        ],
      },
    ],
  },
  escalationAuthority: {
    sections: [
      {
        title: null,
        items: [
          { path: '/escalation/queue', icon: AlertTriangle, labelId: 'nav.alerts', badge: null },
        ],
      },
    ],
  },
};

const ROLE_META = {
  complainant:       { icon: User,        color: '#6366f1', label: 'Citizen',               labelHi: 'नागरिक' },
  callReceiver:      { icon: Headphones,  color: '#f59e0b', label: 'Call Receiver',          labelHi: 'कॉल रिसीवर' },
  flyingSquad:       { icon: Shield,      color: '#10b981', label: 'Flying Squad',           labelHi: 'फ्लाइंग स्क्वाड' },
  admin:             { icon: Settings,    color: '#8b5cf6', label: 'Administrator',          labelHi: 'प्रशासक' },
  escalationAuthority: { icon: Crown,     color: '#ef4444', label: 'Escalation Authority',  labelHi: 'उच्चाधिकारी' },
};

export default function Sidebar() {
  const { currentRole, roleConfig, switchRole, roles } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatMessage } = useIntl();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarConfig = SIDEBAR_NAV[currentRole] || { sections: [] };
  const roleMeta = ROLE_META[currentRole] || {};
  const RoleIcon = roleMeta.icon || HelpCircle;

  // Sync collapsed state to layout wrapper so app-main margin can adjust
  React.useEffect(() => {
    const layout = document.querySelector('.app-layout');
    if (layout) {
      layout.setAttribute('data-sidebar-collapsed', collapsed);
    }
  }, [collapsed]);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>

      {/* Role badge */}
      <div className="sidebar-role-badge" style={{ '--role-color': roleMeta.color }}>
        <div className="sidebar-role-icon">
          <RoleIcon size={18} />
        </div>
        {!collapsed && (
          <div className="sidebar-role-info">
            <div className="sidebar-role-label">
              {locale === 'hi' ? roleMeta.labelHi : roleMeta.label}
            </div>
            <div className="sidebar-role-sub">Active Session</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sidebarConfig.sections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <div className="sidebar-section-title">{section.title}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? formatMessage({ id: item.labelId }) : undefined}
                >
                  <Icon size={20} />
                  {!collapsed && (
                    <span className="sidebar-item-label">
                      {formatMessage({ id: item.labelId })}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <span className="sidebar-active-dot" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Switch role (quick switcher) */}
      {!collapsed && (
        <div className="sidebar-section-title">Switch Role</div>
      )}
      <div className="sidebar-nav" style={{ gap: 2 }}>
        {Object.values(roles).map((role) => {
          const meta = ROLE_META[role.id];
          if (!meta) return null;
          const Icon = meta.icon;
          const isActive = currentRole === role.id;
          return (
            <button
              key={role.id}
              className={`sidebar-item sidebar-role-switch ${isActive ? 'active' : ''}`}
              onClick={() => { switchRole(role.id); navigate(role.defaultRoute); }}
              title={collapsed ? (locale === 'hi' ? meta.labelHi : meta.label) : undefined}
              style={{ '--role-color': meta.color }}
            >
              <Icon size={16} />
              {!collapsed && (
                <span className="sidebar-item-label" style={{ fontSize: 'var(--text-xs)' }}>
                  {locale === 'hi' ? meta.labelHi : meta.label}
                </span>
              )}
              {isActive && (
                <span className="sidebar-role-active-indicator" />
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
