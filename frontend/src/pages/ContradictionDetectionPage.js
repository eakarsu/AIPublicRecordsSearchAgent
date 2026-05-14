import React, { useState } from 'react';
import api from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function ContradictionDetectionPage({ showToast }) {
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('person');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entityName.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/contradiction-detection', {
        entity: entityName,
        entity_type: entityType,
      });
      setResult(res.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Detection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed || result;
  const contradictions = parsed?.contradictions || parsed?.flagged || [];

  const sevColor = (sev) => {
    const s = String(sev || '').toLowerCase();
    if (s === 'critical' || s === 'high') return '#dc2626';
    if (s === 'medium') return '#d97706';
    if (s === 'low') return '#2563eb';
    return '#4b5563';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Contradiction Detection</h1>
          <p>Surface conflicts across court, property, business, taxlien, license, contract, and regulatory records</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: '#6b7280',
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Entity name *
          </label>
          <input
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="e.g., John Smith, Acme Corp"
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
            required
          />
        </div>
        <div style={{ width: 200 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: '#6b7280',
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Entity type
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
            <option value="property">Property</option>
          </select>
        </div>
        <button
          type="submit"
          className="add-new-btn"
          disabled={loading || !entityName.trim()}
        >
          {loading ? 'Scanning...' : 'Detect Contradictions'}
        </button>
      </form>

      {loading && <AIAnalysis loading />}

      {!loading && contradictions.length > 0 && (
        <div className="ai-analysis-container" style={{ marginBottom: 16 }}>
          <div className="ai-analysis-header">
            <div className="ai-icon">⚠️</div>
            <h3>Contradictions ({contradictions.length})</h3>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {contradictions.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 0',
                  borderBottom: i < contradictions.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ color: '#111827' }}>
                    {c.title || c.summary || c.description || `Conflict ${i + 1}`}
                  </strong>
                  {c.severity && (
                    <span
                      style={{
                        color: sevColor(c.severity),
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {c.severity}
                    </span>
                  )}
                </div>
                {c.evidence && (
                  <div style={{ marginTop: 4, fontSize: 13, color: '#4b5563' }}>
                    <em>Evidence:</em>{' '}
                    {Array.isArray(c.evidence) ? c.evidence.join('; ') : c.evidence}
                  </div>
                )}
                {c.records && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
                    Sources:{' '}
                    {Array.isArray(c.records) ? c.records.join(', ') : String(c.records)}
                  </div>
                )}
                {c.explanation && (
                  <div style={{ marginTop: 4, fontSize: 13, color: '#374151' }}>
                    {c.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && parsed?.analysis && <AIAnalysis analysis={parsed.analysis} />}
    </div>
  );
}
