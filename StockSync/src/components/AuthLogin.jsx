import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

function AuthLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo',
      name: 'Demo User',
      username: 'demo',
      role: 'warehouse-staff'
    };
    onLogin(demoUser, 'demo-token');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '20px'
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      border: '1px solid #334155',
      width: '100%',
      maxWidth: '400px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logo: {
      fontSize: '32px',
      marginBottom: '8px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#f1f5f9',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '14px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#e2e8f0'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #475569',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
      backgroundColor: '#334155',
      color: '#f1f5f9'
    },
    inputFocus: {
      borderColor: '#3b82f6'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    buttonHover: {
      backgroundColor: '#2563eb'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    toggleButton: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: '0'
    },
    demoButton: {
      padding: '12px 24px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '16px'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      border: '1px solid #fecaca'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      fontSize: '14px',
      color: '#94a3b8'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#475569'
    },
    dividerText: {
      padding: '0 16px',
      backgroundColor: '#1e293b'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>📦</div>
          <h1 style={styles.title}>StockSync</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              style={styles.input}
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                username: e.target.value
              }))}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              style={styles.toggleButton}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>

        <button
          style={styles.demoButton}
          onClick={handleDemoLogin}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#059669';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#10b981';
          }}
        >
          🚀 Continue with Demo
        </button>
      </div>
    </div>
  );
}

export default AuthLogin;
