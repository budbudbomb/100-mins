import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useIntl } from 'react-intl';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import {
  FileText, Search, Phone, ClipboardList,
  AlertTriangle, Map, LayoutDashboard, BarChart3,
  Compass
} from 'lucide-react';

const ROLE_NAV = {
  complainant: [
    { path: '/submit', icon: FileText, labelId: 'nav.submit' },
    { path: '/track', icon: Search, labelId: 'nav.track' },
  ],
  callReceiver: [
    { path: '/receiver/log', icon: Phone, labelId: 'nav.logCall' },
    { path: '/receiver/queue', icon: ClipboardList, labelId: 'nav.review' },
  ],
  flyingSquad: [
    { path: '/squad/alerts', icon: AlertTriangle, labelId: 'nav.alerts' },
    { path: '/squad/map', icon: Compass, labelId: 'nav.map' },
  ],
  admin: [
    { path: '/admin/dashboard', icon: LayoutDashboard, labelId: 'nav.dashboard' },
    { path: '/admin/map', icon: Map, labelId: 'nav.map' },
    { path: '/admin/complaints', icon: ClipboardList, labelId: 'nav.complaints' },
    { path: '/admin/analytics', icon: BarChart3, labelId: 'nav.analytics' },
  ],
  escalationAuthority: [
    { path: '/escalation/queue', icon: AlertTriangle, labelId: 'nav.alerts' },
  ],
};

export default function BottomNav() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatMessage } = useIntl();
  const isKeyboardVisible = useKeyboardVisible();

  const navItems = ROLE_NAV[currentRole] || [];

  // Hide when keyboard is open
  if (isKeyboardVisible) return null;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-pill">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="bottom-nav-icon-wrapper">
                <Icon />
              </div>
              <span>{formatMessage({ id: item.labelId })}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
