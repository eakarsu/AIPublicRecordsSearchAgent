import React, { useState } from 'react';
import { entityLink } from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function EntityLinkPage({ showToast }) {
  const [entityName, setEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entityName.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await entityLink({ entityName });
      setResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Entity link search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (analysis) => {
    if (!analysis) return '#6b7280';
    const lower = analysis.toLowerCase();
    if (lower.includes('high risk')) return '#dc2626';
    if (lower.includes('medium risk')) return '#d97706';
    if (lower.includes('low risk')) return '#059669';
    return '#6b7280';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Entity Link Analyzer</h1>
          <p>Search all public records for a person or business and get a comprehensive AI risk profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={entityName}
          onChange={e => setEntityName(e.target.value)}
          placeholder="Enter person or business name to search all public records..."
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
        />
        <button type="submit" className="add-new-btn" disabled={loading || !entityName.trim()}>
          {loading ? 'Analyzing...' : 'Search & Analyze'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%' }}></div>
          Searching across all 13 public record databases...
        </div>
      )}

      {result && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', background: '#eff6ff', borderRadius: 6, fontSize: 13 }}>
              <strong>{result.totalFound}</strong> records found
            </div>
            {Object.entries(result.records || {})
              .filter(([, arr]) => arr.length > 0)
              .map(([type, arr]) => (
                <div key={type} style={{ padding: '8px 14px', background: '#f0fdf4', borderRadius: 6, fontSize: 13 }}>
                  {type}: <strong>{arr.length}</strong>
                </div>
              ))}
          </div>
          <AIAnalysis analysis={result.analysis} />
        </div>
      )}
    </div>
  );
}
