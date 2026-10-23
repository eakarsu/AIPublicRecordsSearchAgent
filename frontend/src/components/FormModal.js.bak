import React, { useState, useEffect } from 'react';

export default function FormModal({ feature, item, onSave, onClose }) {
  const [formData, setFormData] = useState({});
  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      const initial = {};
      feature.fields.forEach(f => { initial[f.key] = ''; });
      setFormData(initial);
    }
  }, [item, feature]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit' : 'New'} {feature.name.replace(/s$/, '')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {feature.fields.map(field => (
              <div key={field.key} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                <label>{field.label} {field.required && '*'}</label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    step={field.type === 'number' ? 'any' : undefined}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
