import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SOURCE_TYPES = ['CourtRecord', 'PropertyRecord', 'BusinessFiling', 'BuildingPermit', 'VitalRecord',
                      'TaxLien', 'EnvironmentalRecord', 'CampaignFinance', 'ProfessionalLicense', 'GovernmentContract'];

export default function SourceRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ jurisdiction: '', sourceType: SOURCE_TYPES[0], allowed: true, priority: 3, notes: '' });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/custom-views/source-rules');
      setRules(res.data.rules || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.jurisdiction.trim()) return;
    try {
      if (editingId) {
        await api.put(`/custom-views/source-rules/${editingId}`, form);
      } else {
        await api.post('/custom-views/source-rules', form);
      }
      setForm({ jurisdiction: '', sourceType: SOURCE_TYPES[0], allowed: true, priority: 3, notes: '' });
      setEditingId(null);
      load();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const edit = (r) => {
    setEditingId(r.id);
    setForm({ jurisdiction: r.jurisdiction, sourceType: r.sourceType, allowed: r.allowed, priority: r.priority, notes: r.notes });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete rule #' + id + '?')) return;
    await api.delete(`/custom-views/source-rules/${id}`);
    load();
  };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Source Rules Editor (Jurisdiction Allowlist)</h3>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 16, padding: 12, background: '#f8f9fb', borderRadius: 6 }}>
        <input placeholder="Jurisdiction (e.g. California)" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
        <select value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })} style={{ padding: 6 }}>
          {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="Priority 1-5" type="number" min={1} max={5} value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={form.allowed} onChange={(e) => setForm({ ...form, allowed: e.target.checked })} /> Allow
        </label>
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4, gridColumn: 'span 3' }} />
        <button type="submit" style={{ padding: '6px 14px', background: editingId ? '#d97706' : '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      {loading && <p>Loading...</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f1f3f5' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Jurisdiction</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Source Type</th>
            <th style={{ padding: 8, textAlign: 'center' }}>Allowed</th>
            <th style={{ padding: 8, textAlign: 'center' }}>Priority</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Notes</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{r.id}</td>
              <td style={{ padding: 8 }}>{r.jurisdiction}</td>
              <td style={{ padding: 8 }}>{r.sourceType}</td>
              <td style={{ padding: 8, textAlign: 'center', color: r.allowed ? '#16a34a' : '#dc2626' }}>{r.allowed ? 'YES' : 'NO'}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{r.priority}</td>
              <td style={{ padding: 8, color: '#666' }}>{r.notes}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                <button onClick={() => edit(r)} style={{ marginRight: 4, padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
              </td>
            </tr>
          ))}
          {!rules.length && !loading && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#999' }}>No rules defined.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
