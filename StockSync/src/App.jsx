import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WebSocketProvider from './components/WebSocketProvider';
import Navigation from './components/Navigation';
import AuthLogin from './components/AuthLogin';
import Dashboard from '../Component/EnhancedDashboard';
import ItemSearch from './components/ItemSearch';
import ShipmentQueue from './components/ShipmentQueue';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
          <div style={{ color: '#94a3b8' }}>Loading StockSync...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthLogin onLogin={handleLogin} />;
  }

  const appStyles = {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    color: '#e2e8f0'
  };

  const mainStyles = {
    flex: 1,
    padding: 'clamp(16px, 3vw, 24px)',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  };

  return (
    <WebSocketProvider>
      <Router>
        <div style={appStyles}>
          <Navigation user={user} onLogout={handleLogout} />
          
          <main style={mainStyles}>
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard />} 
              />
              <Route 
                path="/search" 
                element={
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <ItemSearch onItemSelect={(item) => console.log('Selected:', item)} />
                  </div>
                } 
              />
              <Route 
                path="/shipments" 
                element={
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <ShipmentQueue />
                  </div>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
