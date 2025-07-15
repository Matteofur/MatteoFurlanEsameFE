import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DipendenteDashboard from './components/dashboard/DipendenteDashboard';
import ResponsabileDashboard from './components/dashboard/ResponsabileDashboard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Caricamento...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const DashboardRoute: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'Responsabile') {
    return <ResponsabileDashboard />;
  } else {
    return <DipendenteDashboard />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardRoute />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
      </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
