import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/search', label: 'Item Search', icon: '🔍' },
    { path: '/shipments', label: 'Shipments', icon: '🚚' }
  ];

  const styles = {
    nav: {
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    },
    navContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    brand: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#f1f5f9',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    navLink: {
      textDecoration: 'none',
      color: '#94a3b8',
      fontWeight: '500',
      fontSize: '14px',
      padding: '8px 16px',
      borderRadius: '6px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    activeNavLink: {
      color: '#60a5fa',
      backgroundColor: '#1e40af20'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#94a3b8'
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600'
    },
    logoutButton: {
      backgroundColor: 'transparent',
      border: '1px solid #475569',
      color: '#94a3b8',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    mobileMenuToggle: {
      display: 'none',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#64748b'
    },
    '@media (max-width: 768px)': {
      navLinks: {
        display: 'none'
      },
      mobileMenuToggle: {
        display: 'block'
      }
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        <Link to="/" style={styles.brand}>
          📦 StockSync
        </Link>

        <div style={styles.navLinks}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(location.pathname === item.path ? styles.activeNavLink : {})
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div style={styles.userSection}>
          {user ? (
            <>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {getUserInitials(user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#f1f5f9' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                style={styles.logoutButton}
                onClick={onLogout}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.borderColor = '#64748b';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#475569';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>G</div>
              <div>
                <div style={{ fontWeight: '500', color: '#f1f5f9' }}>
                  Guest User
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Demo Mode
                </div>
              </div>
            </div>
          )}
        </div>

        <button style={styles.mobileMenuToggle}>
          ☰
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
