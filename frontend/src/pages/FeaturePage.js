import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeature } from '../components/featureConfig';
import { getAll, create, remove } from '../services/api';
import FormModal from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function FeaturePage({ showToast }) {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = getFeature(featureId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAll(featureId);
      setItems(res.data);
    } catch (err) {
      showToast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [featureId, showToast]);

  useEffect(() => {
    if (feature) loadItems();
  }, [feature, loadItems]);

  if (!feature) {
    return <div>Feature not found</div>;
  }

  const handleCreate = async (data) => {
    try {
      await create(featureId, data);
      showToast('Record created successfully');
      setShowModal(false);
      loadItems();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create record', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(featureId, deleteTarget);
      showToast('Record deleted successfully');
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      showToast('Failed to delete record', 'error');
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'number') {
      if (val > 1000) return '$' + Number(val).toLocaleString();
      return val.toString();
    }
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(val).toLocaleDateString();
    }
    return String(val);
  };

  const getStatusColumn = (col) => {
    const statusCols = ['status', 'titleStatus', 'caseType', 'priority', 'riskLevel', 'lienType', 'recordType', 'entityType', 'permitType', 'filingType'];
    return statusCols.includes(col);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <div className="page-title">
            <h1>{feature.icon} {feature.name}</h1>
            <p>{feature.description}</p>
          </div>
        </div>
        <button className="add-new-btn" onClick={() => setShowModal(true)}>
          + New {feature.name.replace(/s$/, '')}
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {feature.columns.map(col => (
                  <th key={col}>{col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => navigate(`/feature/${featureId}/${item.id}`)}>
                  {feature.columns.map(col => (
                    <td key={col}>
                      {getStatusColumn(col) ? (
                        <span className={`status-badge ${(item[col] || '').replace(/ /g, '_')}`}>
                          {(item[col] || '-').replace(/_/g, ' ')}
                        </span>
                      ) : (
                        formatValue(item[col])
                      )}
                    </td>
                  ))}
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-delete"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => setDeleteTarget(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={feature.columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No records found. Click "New" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <FormModal
          feature={feature}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
