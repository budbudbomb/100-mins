import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useIntl } from 'react-intl';
import { 
  Shield, Globe, User, Headphones, LayoutDashboard, 
  ChevronDown, Bell, Menu, Sun, Moon
} from 'lucide-react';

const ROLE_ICONS = {
  complainant: User,
  callReceiver: Headphones,
  flyingSquad: Shield,
  admin: LayoutDashboard,
  escalationAuthority: Shield,
};

export default function Header() {
  const { currentRole, roleConfig, switchRole, roles } = useAuth();
  const { locale, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const [showRolePicker, setShowRolePicker] = React.useState(false);

  const RoleIcon = ROLE_ICONS[currentRole] || User;

  const handleRoleSwitch = (roleId) => {
    switchRole(roleId);
    setShowRolePicker(false);
    navigate(roles[roleId].defaultRoute);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">
          <div className="header-logo-icon">EC</div>
          <div>
            <div className="header-title">
              {formatMessage({ id: 'app.title' })}
            </div>
            <div className="header-subtitle">
              {formatMessage({ id: 'app.subtitle' })}
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button className="lang-toggle" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '6px', borderRadius: '50%' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button className="lang-toggle" onClick={toggleLanguage} title="Switch Language">
          <Globe size={14} />
          {formatMessage({ id: 'language.toggle' })}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowRolePicker(!showRolePicker)}
            style={{ 
              gap: '6px',
              borderColor: roleConfig?.color || 'var(--border)',
              color: roleConfig?.color || 'var(--text-secondary)',
            }}
          >
            <RoleIcon size={16} />
            <span className="hide-mobile">
              {formatMessage({ id: `role.${currentRole}` })}
            </span>
            <ChevronDown size={14} />
          </button>

          {showRolePicker && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                onClick={() => setShowRolePicker(false)} 
              />
              <div className="role-dropdown animate-scale-in" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-2)',
                minWidth: '200px',
                zIndex: 100,
                boxShadow: 'var(--shadow-xl)',
              }}>
                <div style={{
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {formatMessage({ id: 'role.switch' })}
                </div>
                {Object.entries(roles).map(([id, role]) => {
                  const Icon = ROLE_ICONS[id] || User;
                  return (
                    <button
                      key={id}
                      onClick={() => handleRoleSwitch(id)}
                      className="sidebar-item"
                      style={{
                        width: '100%',
                        ...(currentRole === id ? {
                          background: 'var(--primary-100)',
                          color: role.color,
                        } : {}),
                      }}
                    >
                      <Icon size={18} />
                      <span>{formatMessage({ id: `role.${id}` })}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
