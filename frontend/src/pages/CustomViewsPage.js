import React from 'react';
import QueryFrequencyChart from '../components/QueryFrequencyChart';
import SourceHeatmap from '../components/SourceHeatmap';
import SearchResultsPDF from '../components/SearchResultsPDF';
import SourceRulesEditor from '../components/SourceRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Records Views</h1>
        <p style={{ color: '#666', marginTop: 4 }}>Custom analytics, exports, and source rule management for public records search.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <QueryFrequencyChart />
        <SourceHeatmap />
      </div>
      <div style={{ marginBottom: 20 }}>
        <SearchResultsPDF />
      </div>
      <div>
        <SourceRulesEditor />
      </div>
    </div>
  );
}
