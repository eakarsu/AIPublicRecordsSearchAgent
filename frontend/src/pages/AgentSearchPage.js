import React, { useState } from 'react';
import { agentSearch } from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function AgentSearchPage({ showToast }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await agentSearch({ query });
      setResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Agent search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCitationCount = (citations) => {
    if (!citations) return 0;
    return Object.values(citations).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>AI Agent Search</h1>
          <p>Natural language search across all public record databases with AI synthesis</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask anything about public records... e.g., 'Find all court cases involving Smith Construction' or 'What government contracts does TechCorp hold?'"
          style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button type="submit" className="add-new-btn" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'AI Search'}
          </button>
          <button type="button" onClick={() => { setQuery(''); setResult(null); }} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%' }}></div>
          Searching all records and synthesizing results...
        </div>
      )}

      {result && (
        <div>
          {result.totalFound !== undefined && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: '#eff6ff', borderRadius: 6, fontSize: 13, color: '#1e40af' }}>
              Found {getCitationCount(result.citations)} related records across {Object.values(result.citations || {}).filter(a => a.length > 0).length} categories
            </div>
          )}
          <AIAnalysis analysis={result.analysis} />
          {result.citations && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Source Records</h3>
              {Object.entries(result.citations).filter(([, arr]) => arr.length > 0).map(([type, records]) => (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#4b5563', marginBottom: 6, textTransform: 'capitalize' }}>
                    {type.replace(/([A-Z])/g, ' $1')} ({records.length})
                  </div>
                  {records.map(r => (
                    <div key={r.id} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 6, fontSize: 13, color: '#374151', marginBottom: 4 }}>
                      {Object.entries(r).filter(([k]) => !['id', 'createdAt', 'updatedAt', 'aiAnalysis'].includes(k)).slice(0, 4).map(([k, v]) => `${k}: ${v || '-'}`).join(' | ')}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
