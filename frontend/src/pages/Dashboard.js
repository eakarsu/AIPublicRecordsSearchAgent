import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { features } from '../components/featureConfig';
import { getAll, aiSearch } from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const results = {};
    let total = 0;
    for (const f of features) {
      try {
        const res = await getAll(f.id);
        results[f.id] = res.data.length;
        total += res.data.length;
      } catch {
        results[f.id] = 0;
      }
    }
    setCounts(results);
    setTotalRecords(total);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await aiSearch({ query: searchQuery, category: 'general' });
      setSearchResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Search failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Public Records Search Dashboard</h1>
        <p>AI-powered search across government records, filings, and public documents</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{features.length}</div>
          <div className="stat-label">Record Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">13</div>
          <div className="stat-label">AI Analysis Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-value">24/7</div>
          <div className="stat-label">Search Availability</div>
        </div>
      </div>

      <form className="ai-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="AI-powered search across all public records... (e.g., 'Find EPA violations in Texas')"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="ai-search-btn" disabled={searching}>
          {searching ? 'Searching...' : '🤖 AI Search'}
        </button>
      </form>

      {(searching || searchResult) && (
        <AIAnalysis data={searchResult} loading={searching} />
      )}

      <div className="feature-grid">
        {features.map(f => (
          <div
            key={f.id}
            className="feature-card"
            style={{ '--card-color': f.color }}
            onClick={() => navigate(`/feature/${f.id}`)}
          >
            <div
              className="feature-card-icon"
              style={{ background: `${f.color}20` }}
            >
              {f.icon}
            </div>
            <h3>{f.name}</h3>
            <p>{f.description}</p>
            <div className="card-count">
              {counts[f.id] !== undefined ? counts[f.id] : '...'} records
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
