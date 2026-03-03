import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ToolsPage from './pages/ToolsPage';
import WarRoom from './pages/WarRoom';
import RadarPage from './pages/RadarPage';
import Dashboard from './pages/Dashboard';
import StitchPage from './pages/StitchPage';
import AntigravityPage from './pages/AntigravityPage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/radar" element={<RadarPage />} />
          <Route path="/war-room" element={<WarRoom />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stitch/:projectId" element={<StitchPage />} />
          <Route path="/antigravity/:projectId" element={<AntigravityPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
