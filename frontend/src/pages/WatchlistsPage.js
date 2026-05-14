import React, { useState, useEffect, useCallback } from 'react';
import { getWatchlists, createWatchlist, deleteWatchlist, checkWatchlist } from '../services/api';
import AIAnalysis from '../components/AIAnalysis';

export default function WatchlistsPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', entityName: '', entityType: 'general', notes: '' });
  const [saving, setSaving] = useState(false);
  const [checkResult, setCheckResult] = useState({});
  const [checkLoading, setCheckLoading] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWatchlists();
      const d = res.data;
      setItems(d.data || d);
    } catch (err) {
      showToast('Failed to load watchlists', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.entityName) { showToast('Name and entity name are required', 'error'); return; }
    setSaving(true);
    try {
      await createWatchlist(form);
      showToast('Watchlist item created');
      setShowForm(false);
      setForm({ name: '', entityName: '', entityType: 'general', notes: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.errors?.[0]?.msg || 'Failed to create watchlist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this watchlist item?')) return;
    try {
      await deleteWatchlist(id);
      showToast('Deleted successfully');
      load();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleCheck = async (id) => {
    setCheckLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await checkWatchlist(id);
      setCheckResult(prev => ({ ...prev, [id]: res.data }));
      showToast('Check completed');
      load();
    } catch (err) {
      showToast('Check failed', 'error');
    } finally {
      setCheckLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Watchlists</h1>
          <p>Monitor persons, businesses, and entities across all public records</p>
        </div>
        <button className="add-new-btn" onClick={() => setShowForm(true)}>+ Add to Watchlist</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : items.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👁️</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No watchlist items</h3>
          <p>Add entities to monitor them across all public records</p>
          <button className="add-new-btn" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Add First Item</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>{item.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
                    <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 12, fontSize: 12, marginRight: 8 }}>{item.entityType}</span>
                    Entity: <strong>{item.entityName}</strong>
                  </div>
                  {item.notes && <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>{item.notes}</div>}
                  {item.lastChecked && (
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                      Last checked: {new Date(item.lastChecked).toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleCheck(item.id)}
                    disabled={checkLoading[item.id]}
                    style={{ padding: '7px 14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                  >
                    {checkLoading[item.id] ? 'Checking...' : 'Check Now'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-delete" style={{ padding: '7px 14px', fontSize: 13 }}>Delete</button>
                </div>
              </div>
              {checkResult[item.id] && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  <div style={{ color: '#374151', fontSize: 13, marginBottom: 6 }}>
                    <strong>Records found:</strong> {checkResult[item.id].totalFound}
                  </div>
                  <AIAnalysis analysis={checkResult[item.id].checkResult} />
                </div>
              )}
              {!checkResult[item.id] && item.checkResult && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  <AIAnalysis analysis={item.checkResult} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Add to Watchlist</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              {[
                { key: 'name', label: 'Watchlist Name *', placeholder: 'e.g., Smith Family Investigation' },
                { key: 'entityName', label: 'Entity Name to Monitor *', placeholder: 'Person or business name' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
                  <input type="text" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Entity Type</label>
                <select value={form.entityType} onChange={e => setForm(prev => ({ ...prev, entityType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}>
                  <option value="general">General</option>
                  <option value="person">Person</option>
                  <option value="business">Business</option>
                  <option value="property">Property</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Any additional context..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="add-new-btn" disabled={saving}>{saving ? 'Saving...' : 'Add to Watchlist'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
