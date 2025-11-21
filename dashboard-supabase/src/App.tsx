import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Fechamento from './components/Fechamento';
import UserManagement from './components/Auth/UserManagement';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas com Layout (Header + Abas) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fechamento" element={<Fechamento />} />
          </Route>

          {/* Rota sem Layout */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;