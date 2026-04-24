import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeature } from '../components/featureConfig';
import { getOne, update, remove, analyzeAI } from '../services/api';
import FormModal from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import AIAnalysis from '../components/AIAnalysis';

export default function DetailPage({ showToast }) {
  const { featureId, id } = useParams();
  const navigate = useNavigate();
  const feature = getFeature(featureId);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOne(featureId, id);
      setItem(res.data);
    } catch {
      showToast('Failed to load record', 'error');
      navigate(`/feature/${featureId}`);
    } finally {
      setLoading(false);
    }
  }, [featureId, id, navigate, showToast]);

  useEffect(() => {
    if (feature) loadItem();
  }, [feature, loadItem]);

  if (!feature) return <div>Feature not found</div>;

  const handleUpdate = async (data) => {
    try {
      await update(featureId, id, data);
      showToast('Record updated successfully');
      setShowEdit(false);
      loadItem();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(featureId, id);
      showToast('Record deleted successfully');
      navigate(`/feature/${featureId}`);
    } catch {
      showToast('Failed to delete record', 'error');
    }
  };

  const handleAIAnalyze = async () => {
    if (!item) return;
    setAnalyzing(true);
    setAiResult(null);
    try {
      const aiData = {};
      feature.aiFields.forEach(key => {
        aiData[key] = item[key];
      });
      const res = await analyzeAI(feature.aiType, aiData);
      setAiResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'AI analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatValue = (val, key) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    if (typeof val === 'number') {
      const moneyFields = ['assessedValue', 'marketValue', 'taxAmount', 'estimatedCost', 'amount', 'contractValue', 'damagesAmount', 'cleanupCost', 'penaltyAmount', 'lastSalePrice'];
      if (moneyFields.includes(key)) return '$' + Number(val).toLocaleString();
      return val.toString();
    }
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return String(val).replace(/_/g, ' ');
  };

  const isMoneyField = (key) => {
    return ['assessedValue', 'marketValue', 'taxAmount', 'estimatedCost', 'amount', 'contractValue', 'damagesAmount', 'cleanupCost', 'penaltyAmount', 'lastSalePrice'].includes(key);
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="detail-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate(`/feature/${featureId}`)}>
            ←
          </button>
          <div className="page-title">
            <h1>{feature.icon} Record Details</h1>
            <p>{feature.name} - ID #{id}</p>
          </div>
        </div>
      </div>

      <div className="detail-card">
        <h2>📄 Record Information</h2>
        <div className="detail-grid">
          {feature.fields.map(field => (
            <div key={field.key} className="detail-field">
              <label>{field.label}</label>
              <div className={`value ${isMoneyField(field.key) ? 'money' : ''}`}>
                {field.key === 'status' || field.key === 'titleStatus' || field.key === 'caseType' || field.key === 'priority' || field.key === 'riskLevel' ? (
                  <span className={`status-badge ${(item?.[field.key] || '').replace(/ /g, '_')}`}>
                    {formatValue(item?.[field.key], field.key)}
                  </span>
                ) : (
                  formatValue(item?.[field.key], field.key)
                )}
              </div>
            </div>
          ))}
          <div className="detail-field">
            <label>Created</label>
            <div className="value">{item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</div>
          </div>
          <div className="detail-field">
            <label>Last Updated</label>
            <div className="value">{item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</div>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn-edit" onClick={() => setShowEdit(true)}>
            ✏️ Edit Record
          </button>
          <button className="btn-delete" onClick={() => setShowDelete(true)}>
            🗑️ Delete Record
          </button>
          <button className="btn-ai-analyze" onClick={handleAIAnalyze} disabled={analyzing}>
            {analyzing ? '🔄 Analyzing...' : '🤖 AI Analysis'}
          </button>
        </div>
      </div>

      <AIAnalysis data={aiResult} loading={analyzing} />

      {showEdit && (
        <FormModal
          feature={feature}
          item={item}
          onSave={handleUpdate}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
