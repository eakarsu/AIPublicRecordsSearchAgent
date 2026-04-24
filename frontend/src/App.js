import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import DetailPage from './pages/DetailPage';
import Layout from './components/Layout';
import Toast from './components/Toast';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/feature/:featureId" element={<FeaturePage showToast={showToast} />} />
          <Route path="/feature/:featureId/:id" element={<DetailPage showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </Router>
  );
}

export default App;
