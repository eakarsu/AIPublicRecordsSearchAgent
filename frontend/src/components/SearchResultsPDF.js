import React, { useState } from 'react';
import api from '../services/api';

export default function SearchResultsPDF() {
  const [query, setQuery] = useState('John Smith property holdings');
  const [resultsText, setResultsText] = useState(
    '123 Main St, deed transfer 2024-03-14\nLLC California Sunrise Holdings, active\nBuilding permit BP-2023-44, residential'
  );
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const generate = async () => {
    setLoading(true);
    setOutcome(null);
    try {
      const results = resultsText.split('\n').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/custom-views/results-pdf', { query, results });
      setOutcome(res.data);
    } catch (e) {
      setOutcome({ ok: false, error: e.message });
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!outcome?.base64) return;
    const bin = atob(outcome.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: outcome.mimeType || 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outcome.filename || 'report.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Search Results PDF Export</h3>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Search query / report title</label>
        <input value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Result lines (one per line)</label>
        <textarea value={resultsText} onChange={(e) => setResultsText(e.target.value)} rows={6} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={generate} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>
        {outcome?.ok && (
          <button onClick={download} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Download {outcome.filename} ({outcome.sizeBytes} B)
          </button>
        )}
      </div>
      {outcome && !outcome.ok && <p style={{ color: 'red' }}>{outcome.error}</p>}
    </div>
  );
}
