import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import SubmitComplaint from './components/complainant/SubmitComplaint';
import TrackComplaint from './components/complainant/TrackComplaint';
import ReviewQueue from './components/callReceiver/ReviewQueue';
import LogComplaint from './components/callReceiver/LogComplaint';
import FlyingSquadApp from './components/flyingSquad/FlyingSquadApp';
import AdminDashboard from './components/admin/AdminDashboard';
import './styles/index.css';

function AppRoutes() {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="app-main with-sidebar">
        <Routes>
          {/* Complainant Routes */}
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />

          {/* Call Receiver Routes */}
          <Route path="/receiver/queue" element={<ReviewQueue />} />
          <Route path="/receiver/log" element={<SubmitComplaint />} />

          {/* Flying Squad Routes */}
          <Route path="/squad/alerts" element={<FlyingSquadApp />} />
          <Route path="/squad/map" element={<FlyingSquadApp />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/map" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />
          <Route path="/admin/roles" element={<AdminDashboard />} />

          {/* Escalation Authority */}
          <Route path="/escalation/queue" element={<ReviewQueue />} />

          {/* Default redirect based on role */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}

function RoleRedirect() {
  const { roleConfig } = useAuth();
  return <Navigate to={roleConfig?.defaultRoute || '/submit'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <ComplaintProvider>
              <div className="app-layout">
                <AppRoutes />
              </div>
            </ComplaintProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
