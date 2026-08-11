import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../lib/utils';

const AuthContext = createContext();

const ROLES = {
  complainant: {
    id: 'complainant',
    label: 'Citizen',
    labelHi: 'नागरिक',
    icon: 'User',
    color: '#6366f1',
    routes: ['/submit', '/track'],
    defaultRoute: '/submit',
  },
  callReceiver: {
    id: 'callReceiver',
    label: 'Call Receiver',
    labelHi: 'कॉल रिसीवर',
    icon: 'Headphones',
    color: '#f59e0b',
    routes: ['/receiver/log', '/receiver/queue', '/receiver/detail'],
    defaultRoute: '/receiver/queue',
  },
  flyingSquad: {
    id: 'flyingSquad',
    label: 'Flying Squad',
    labelHi: 'फ्लाइंग स्क्वाड',
    icon: 'Shield',
    color: '#10b981',
    routes: ['/squad/alerts', '/squad/map', '/squad/action', '/squad/status', '/squad/escalate'],
    defaultRoute: '/squad/alerts',
  },
  escalationAuthority: {
    id: 'escalationAuthority',
    label: 'Escalation Authority',
    labelHi: 'उच्चाधिकारी',
    icon: 'Crown',
    color: '#ef4444',
    configurable: true, // This role is pluggable
    actualTitle: 'District Election Officer', // Configurable
    routes: ['/escalation/queue'],
    defaultRoute: '/escalation/queue',
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    labelHi: 'प्रशासक',
    icon: 'LayoutDashboard',
    color: '#8b5cf6',
    routes: ['/admin/dashboard', '/admin/map', '/admin/complaints', '/admin/analytics', '/admin/roles'],
    defaultRoute: '/admin/dashboard',
  },
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => storage.get('currentRole', 'complainant'));
  const [currentUser, setCurrentUser] = useState(() => ({
    id: 'demo-user',
    name: 'Demo User',
    role: storage.get('currentRole', 'complainant'),
    districtId: 'bhopal',
    squadId: 'fs-001',
  }));

  const switchRole = useCallback((roleId) => {
    if (ROLES[roleId]) {
      setCurrentRole(roleId);
      setCurrentUser(prev => ({ ...prev, role: roleId }));
      storage.set('currentRole', roleId);
    }
  }, []);

  const roleConfig = ROLES[currentRole];

  return (
    <AuthContext.Provider value={{
      currentRole,
      currentUser,
      roleConfig,
      switchRole,
      roles: ROLES,
      isRole: (role) => currentRole === role,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { ROLES };
