import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function QueryFrequencyChart() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/custom-views/query-frequency?days=${days}`);
      setData(res.data);
    } catch (e) {
      setData({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  const max = data?.series?.reduce((m, x) => Math.max(m, x.count), 0) || 1;

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Search Query Frequency</h3>
        <div>
          <label style={{ marginRight: 8, fontSize: 13 }}>Days:</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>7</option>
            <option value={14}>14</option>
            <option value={30}>30</option>
          </select>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {data?.ok && (
        <>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            Total: <strong>{data.total}</strong> searches | Peak: <strong>{data.peak?.date}</strong> ({data.peak?.count})
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 4, borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
            {data.series.map((s) => (
              <div key={s.date} title={`${s.date}: ${s.count} (top: ${s.topQuery || '-'})`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', background: 'linear-gradient(180deg, #4f8cff, #2563eb)', height: `${(s.count / max) * 160}px`, borderRadius: '4px 4px 0 0' }} />
                <div style={{ fontSize: 10, marginTop: 2, color: '#555', transform: 'rotate(-40deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>{s.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {data && !data.ok && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
}
