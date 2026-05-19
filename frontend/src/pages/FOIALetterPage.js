import React, { useState } from 'react';
import { generateFOIALetter } from '../services/api';

export default function FOIALetterPage({ showToast }) {
  const [form, setForm] = useState({
    agency: '', subject: '', requestorName: '', requestorEmail: '',
    requestorAddress: '', specificRecords: '', dateRange: '',
  });
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agency || !form.subject || !form.requestorName) {
      showToast('Agency, subject, and your name are required', 'error');
      return;
    }
    setLoading(true);
    setLetter('');
    try {
      const res = await generateFOIALetter(form);
      setLetter(res.data.letter);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate letter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    showToast('Letter copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOIA-Letter-${form.agency.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>FOIA Letter Generator</h1>
          <p>Generate professional, legally-sound FOIA request letters instantly</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: letter ? '1fr 1fr' : '1fr', gap: 24 }}>
        <div>
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Request Details</h3>
            {[
              { key: 'agency', label: 'Government Agency *', placeholder: 'e.g., FBI, EPA, City of Austin' },
              { key: 'subject', label: 'Records Subject *', placeholder: 'Briefly describe the records you want' },
              { key: 'requestorName', label: 'Your Name *', placeholder: 'Full legal name' },
              { key: 'requestorEmail', label: 'Your Email', placeholder: 'email@example.com' },
              { key: 'requestorAddress', label: 'Your Address', placeholder: 'Mailing address' },
              { key: 'specificRecords', label: 'Specific Records', placeholder: 'List specific record types, date ranges, etc.' },
              { key: 'dateRange', label: 'Date Range', placeholder: 'e.g., January 2020 to December 2023' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>{f.label}</label>
                {f.key === 'specificRecords' ? (
                  <textarea
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="add-new-btn" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Generating Letter...' : 'Generate FOIA Letter'}
            </button>
          </form>
        </div>

        {letter && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Generated Letter</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCopy} style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Copy</button>
                <button onClick={handleDownload} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Download</button>
              </div>
            </div>
            <pre style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', maxHeight: 600, overflowY: 'auto', color: '#111827' }}>
              {letter}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
