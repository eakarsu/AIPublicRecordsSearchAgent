import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeature } from '../components/featureConfig';
import { getAll, create, remove } from '../services/api';
import FormModal from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center' }}>
      <button className="btn-secondary" onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ padding: '6px 12px' }}>Prev</button>
      <span style={{ padding: '6px 12px', fontSize: 14, color: '#6b7280' }}>Page {page} of {totalPages}</span>
      <button className="btn-secondary" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ padding: '6px 12px' }}>Next</button>
    </div>
  );
}

export default function FeaturePage({ showToast }) {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = getFeature(featureId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const LIMIT = 20;

  const loadItems = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await getAll(featureId, { page: p, limit: LIMIT, search: s, sort: sortField, dir: sortDir });
      const d = res.data;
      if (d && d.data) {
        setItems(d.data);
        setPage(d.pagination.page);
        setTotalPages(d.pagination.totalPages);
        setTotal(d.pagination.total);
      } else if (Array.isArray(d)) {
        setItems(d);
      }
    } catch (err) {
      showToast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [featureId, showToast, sortField, sortDir]);

  useEffect(() => {
    if (feature) loadItems(1, search);
    setPage(1);
  }, [feature, featureId, sortField, sortDir]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadItems(1, search);
  };

  if (!feature) return <div>Feature not found</div>;

  const handleCreate = async (data) => {
    try {
      await create(featureId, data);
      showToast('Record created successfully');
      setShowModal(false);
      loadItems(page, search);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create record', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(featureId, deleteTarget);
      showToast('Record deleted successfully');
      setDeleteTarget(null);
      loadItems(page, search);
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

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="page-title">
            <h1>{feature.icon} {feature.name}</h1>
            <p>{feature.description}</p>
          </div>
        </div>
        <button className="add-new-btn" onClick={() => setShowModal(true)}>
          + New {feature.name.replace(/s$/, '')}
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search records..."
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
        />
        <button type="submit" className="add-new-btn" style={{ padding: '8px 16px' }}>Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); loadItems(1, ''); }} style={{ padding: '8px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Clear</button>}
      </form>

      <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{total} total records{search ? ` for "${search}"` : ''}</div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {feature.columns.map(col => (
                  <th key={col} onClick={() => toggleSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    {col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    {sortField === col && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
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
                    No records found. {search ? 'Try a different search.' : 'Click "New" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadItems(p, search)} />
        </div>
      )}

      {showModal && (
        <FormModal feature={feature} onSave={handleCreate} onClose={() => setShowModal(false)} />
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
