import React, { useState } from 'react';
import api from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function TimelineReconstructionPage({ showToast }) {
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
      const res = await api.post('/ai/timeline-reconstruction', {
        entity: entityName,
        entity_type: entityType,
      });
      setResult(res.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Reconstruction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed || result;
  const timeline = parsed?.timeline || [];
  const chapters = parsed?.narrative_chapters || parsed?.chapters || [];
  const gaps = parsed?.gaps || [];
  const anomalies = parsed?.anomalies || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Timeline Reconstruction</h1>
          <p>AI-stitched chronology across 13 record types with narrative chapters, gaps, and anomalies</p>
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
          {loading ? 'Reconstructing...' : 'Reconstruct Timeline'}
        </button>
      </form>

      {loading && <AIAnalysis loading />}

      {!loading && timeline.length > 0 && (
        <div className="ai-analysis-container" style={{ marginBottom: 16 }}>
          <div className="ai-analysis-header">
            <div className="ai-icon">📅</div>
            <h3>Timeline ({timeline.length} events)</h3>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {timeline.map((t, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: i < timeline.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{ width: 110, flexShrink: 0, fontSize: 13, color: '#6b7280' }}>
                  {t.date || t.year || '-'}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                  <strong>{t.event || t.title || ''}</strong>
                  {t.source && (
                    <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 12 }}>
                      [{t.source}]
                    </span>
                  )}
                  {t.description && (
                    <div style={{ color: '#4b5563', marginTop: 2 }}>{t.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && chapters.length > 0 && (
        <div className="ai-analysis-container" style={{ marginBottom: 16 }}>
          <div className="ai-analysis-header">
            <div className="ai-icon">📖</div>
            <h3>Narrative Chapters</h3>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {chapters.map((c, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong>{c.title || c.name || `Chapter ${i + 1}`}</strong>
                <div style={{ color: '#374151', fontSize: 13, marginTop: 4 }}>
                  {c.summary || c.text || (typeof c === 'string' ? c : '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (gaps.length > 0 || anomalies.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {gaps.length > 0 && (
            <div className="ai-analysis-container">
              <div className="ai-analysis-header">
                <div className="ai-icon">🕳️</div>
                <h3>Gaps</h3>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <ul>
                  {gaps.map((g, i) => (
                    <li key={i}>{typeof g === 'string' ? g : JSON.stringify(g)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {anomalies.length > 0 && (
            <div className="ai-analysis-container">
              <div className="ai-analysis-header">
                <div className="ai-icon">⚠️</div>
                <h3>Anomalies</h3>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <ul>
                  {anomalies.map((a, i) => (
                    <li key={i}>{typeof a === 'string' ? a : JSON.stringify(a)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && parsed?.analysis && <AIAnalysis analysis={parsed.analysis} />}
    </div>
  );
}
