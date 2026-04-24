import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { features } from './featureConfig';

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>
            <span>🔍</span>
            Public Records AI
          </h2>
          <p>Intelligent Search Agent</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Dashboard</div>
          <button
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <div className="nav-icon">📊</div>
            Overview
          </button>

          <div className="sidebar-section-title">Record Categories</div>
          {features.map(f => (
            <button
              key={f.id}
              className={`nav-item ${isActive(`/feature/${f.id}`) ? 'active' : ''}`}
              onClick={() => navigate(`/feature/${f.id}`)}
            >
              <div className="nav-icon">{f.icon}</div>
              {f.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="name">{user.name}</div>
              <div className="role">{user.role}</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
