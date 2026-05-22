import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function SourceHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/custom-views/source-heatmap');
        setData(res.data);
      } catch (e) {
        setData({ ok: false, error: e.message });
      } finally { setLoading(false); }
    })();
  }, []);

  const color = (count, max) => {
    if (!count) return '#f4f6f8';
    const intensity = count / (max || 1);
    const r = Math.round(255 - intensity * 175);
    const g = Math.round(255 - intensity * 130);
    const b = Math.round(255 - intensity * 50);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Source × Record Type Heatmap</h3>
      {loading && <p>Loading...</p>}
      {data?.ok && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #ddd' }}>Source / Record Type</th>
                {data.recordTypes.map((rt) => (
                  <th key={rt} style={{ padding: 6, borderBottom: '1px solid #ddd', textAlign: 'center' }}>{rt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.source}>
                  <td style={{ padding: 6, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.source}</td>
                  {row.cells.map((c) => (
                    <td key={c.recordType}
                        title={`${row.source} × ${c.recordType}: ${c.count} searches (avg ${c.avgResults} results)`}
                        style={{ padding: 0 }}>
                      <div style={{ background: color(c.count, data.max), padding: '14px 18px', textAlign: 'center', minWidth: 50, color: c.count > data.max * 0.6 ? '#fff' : '#222' }}>
                        {c.count}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>Max cell: {data.max} searches</div>
        </div>
      )}
      {data && !data.ok && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
}
