import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIAnalysis({ data, loading }) {
  if (loading) {
    return (
      <div className="ai-analysis-container">
        <div className="ai-analysis-header">
          <div className="ai-icon">🤖</div>
          <h3>AI Analysis in Progress...</h3>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="ai-analysis-container">
      <div className="ai-analysis-header">
        <div className="ai-icon">🤖</div>
        <h3>AI Analysis Report</h3>
        {data.model && (
          <span className="model-badge">Model: {data.model}</span>
        )}
      </div>
      <div className="ai-analysis-content">
        <ReactMarkdown>{data.analysis}</ReactMarkdown>
      </div>
      {data.usage && (
        <div className="ai-analysis-footer">
          <span>📊 Prompt tokens: {data.usage.prompt_tokens}</span>
          <span>📝 Completion tokens: {data.usage.completion_tokens}</span>
          <span>📈 Total tokens: {data.usage.total_tokens}</span>
        </div>
      )}
    </div>
  );
}
