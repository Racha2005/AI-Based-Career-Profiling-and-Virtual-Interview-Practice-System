import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Topbar         from './components/Topbar';
import Layout         from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage         from './pages/HomePage';
import AuthPage         from './pages/AuthPage';
import DashboardPage    from './pages/DashboardPage';
import AIInterviewPage  from './pages/AIInterviewPage';
import ChatbotPage      from './pages/ChatbotPage';
import SupportPage      from './pages/SupportPage';
import AboutPage        from './pages/AboutPage';
import CareerFormPage   from './pages/CareerFormPage';

import './assets/css/styles.css';

function Protected({ children }) {
  return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Topbar />
        <Routes>
          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/support"  element={<SupportPage />} />

          {/* Protected */}
          <Route path="/dashboard"    element={<Protected><DashboardPage /></Protected>} />
          <Route path="/ai-interview" element={<Protected><AIInterviewPage /></Protected>} />
          <Route path="/chatbot"      element={<Protected><ChatbotPage /></Protected>} />
          <Route path="/about"        element={<Protected><AboutPage /></Protected>} />
          <Route path="/career-form"  element={<Protected><CareerFormPage /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
