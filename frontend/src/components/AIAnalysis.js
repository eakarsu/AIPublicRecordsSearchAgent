import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIAnalysis({ data, analysis, loading }) {
  if (loading) {
    return (
      <div className="ai-analysis-container">
        <div className="ai-analysis-header">
          <div className="ai-icon">🤖</div>
          <h3>AI Analysis in Progress...</h3>
        </div>
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  const content = analysis || data?.analysis;
  const model = data?.model;
  const usage = data?.usage;

  if (!content) return null;

  return (
    <div className="ai-analysis-container">
      <div className="ai-analysis-header">
        <div className="ai-icon">🤖</div>
        <h3>AI Analysis Report</h3>
        {model && <span className="model-badge">Model: {model}</span>}
      </div>
      <div className="ai-analysis-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {usage && (
        <div className="ai-analysis-footer">
          <span>Prompt tokens: {usage.prompt_tokens}</span>
          <span>Completion tokens: {usage.completion_tokens}</span>
          <span>Total tokens: {usage.total_tokens}</span>
        </div>
      )}
    </div>
  );
}
