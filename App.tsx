import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Homepage } from './components/Homepage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { ResourcesPage } from './components/ResourcesPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { CommunityPage } from './components/CommunityPage';
import { ContactPage } from './components/ContactPage';
import { HealthTipsPage } from './components/HealthTipsPage';
import { PsychFactsPage } from './components/PsychFactsPage';
import { MoodTracker } from './components/MoodTracker';
import { AppointmentBooking } from './components/AppointmentBooking';
import { CrisisSupport } from './components/CrisisSupport';

// Protected Route component for authenticated users only
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Main App wrapper component that handles user state
function AppContent() {
  const [user, setUser] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
    setSelectedChallenges(userData.challenges || []);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedChallenges([]);
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Get current page from location pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.slice(1); // Remove leading slash
  };

  return (
    <div className="min-h-screen bg-therapy-gradient-soft">
      <Header 
        currentPage={getCurrentPage()} 
        onNavigate={handleNavigation} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Homepage onNavigate={handleNavigation} />} />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigation} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} onNavigate={handleNavigation} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} challenges={selectedChallenges} onNavigate={handleNavigation} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute user={user}>
                <ChatInterface user={user} onNavigate={handleNavigation} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mood-tracker" 
            element={
              <ProtectedRoute user={user}>
                <MoodTracker user={user} onNavigate={handleNavigation} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute user={user}>
                <AppointmentBooking user={user} onNavigate={handleNavigation} />
              </ProtectedRoute>
            } 
          />
          <Route path="/community" element={<CommunityPage onNavigate={handleNavigation} />} />
          <Route path="/resources" element={<ResourcesPage onNavigate={handleNavigation} />} />
          <Route path="/health-tips" element={<HealthTipsPage onNavigate={handleNavigation} />} />
          <Route path="/psychology-facts" element={<PsychFactsPage onNavigate={handleNavigation} />} />
          <Route path="/crisis-support" element={<CrisisSupport onNavigate={handleNavigation} />} />
          <Route path="/contact" element={<ContactPage onNavigate={handleNavigation} />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}