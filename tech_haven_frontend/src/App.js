import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

/**
 * Simple helper to read the backend base URL.
 * Uses environment variable REACT_APP_BACKEND_URL when provided, otherwise falls back to local proxy.
 * Note for deployment: set REACT_APP_BACKEND_URL in environment to the backend origin.
 */
const getBackendBaseUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  // If not provided, default to backend container indicated in work item (port 3001)
  return (envUrl && envUrl.trim().length > 0) ? envUrl : 'https://vscode-internal-36968-beta.beta01.cloud.kavia.ai:3001';
};

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState(null); // { matched, id, title, answer, score }
  const [error, setError] = useState('');
  const [kbItems, setKbItems] = useState([]);
  const backendBaseUrl = useMemo(getBackendBaseUrl, []);

  // Apply theme to <html> for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load knowledge base on mount
  useEffect(() => {
    const loadKb = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/knowledge-base`, {
          headers: { 'Accept': 'application/json' },
          method: 'GET',
        });
        if (!res.ok) {
          throw new Error(`Failed to load knowledge base (${res.status})`);
        }
        const data = await res.json();
        setKbItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        // Non-fatal; just show a subtle message in UI
        // eslint-disable-next-line no-console
        console.warn('Could not fetch knowledge base:', e);
      }
    };
    loadKb();
  }, [backendBaseUrl]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAnswer(null);

    const q = question.trim();
    if (!q) {
      setError('Please enter your question.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendBaseUrl}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        // Attempt to parse error response
        let details = '';
        try {
          const errJson = await res.json();
          details = errJson?.message ? `: ${errJson.message}` : '';
        } catch (_) {
          // ignore JSON parse errors
        }
        throw new Error(`Request failed (${res.status})${details}`);
      }

      const data = await res.json();
      setAnswer(data);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAnswer = () => {
    if (error) {
      return (
        <div className="card error">
          <div className="card-title">Error</div>
          <div className="card-body">
            <p>{error}</p>
            <p className="muted">
              Make sure the backend is running and reachable from this page. If using a different host/port, set REACT_APP_BACKEND_URL accordingly.
            </p>
          </div>
        </div>
      );
    }
    if (answer == null) return null;

    return (
      <div className="card success">
        <div className="card-title">
          {answer.matched ? 'Answer found' : 'No exact match — best guidance'}
        </div>
        <div className="card-body">
          {answer.title && <div className="pill">KB: {answer.title}</div>}
          <p className="answer-text">{answer.answer}</p>
          <div className="meta">
            <span className="meta-item">Relevance: {answer.score}</span>
            {answer.id && <span className="meta-item">ID: {answer.id}</span>}
            <span className="meta-item">Matched: {String(answer.matched)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderKb = () => {
    if (!kbItems || kbItems.length === 0) {
      return (
        <div className="kb-placeholder">
          Knowledge base will appear here when available.
        </div>
      );
    }
    return (
      <div className="kb-grid">
        {kbItems.map((item) => (
          <div key={item.id} className="kb-card">
            <div className="kb-title">{item.title}</div>
            {Array.isArray(item.keywords) && item.keywords.length > 0 && (
              <div className="kb-tags">
                {item.keywords.map((kw) => (
                  <span key={kw} className="tag">{kw}</span>
                ))}
              </div>
            )}
            <div className="kb-answer">{item.answer}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="th-header">
        <div className="brand">
          <div className="logo" aria-hidden="true">🛍️</div>
          <div className="brand-text">
            <div className="title">Tech Haven Support</div>
            <div className="subtitle">Ask about store hours, returns, and warranties</div>
          </div>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="container">
        <section className="panel">
          <form onSubmit={handleSubmit} className="ask-form">
            <label htmlFor="question" className="label">Your question</label>
            <textarea
              id="question"
              className="input"
              placeholder="e.g., What are your store hours on weekends?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            <div className="actions">
              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Asking…' : 'Ask'}
              </button>
              <span className="help">
                Backend: <code>{backendBaseUrl}</code>
              </span>
            </div>
          </form>

          <div className="answer-section">
            {renderAnswer()}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Knowledge Base</h2>
            <p className="panel-subtitle">Reference items used to answer questions</p>
          </div>
          {renderKb()}
        </section>
      </main>

      <footer className="footer">
        <span>Tech Haven Q&A • Frontend</span>
      </footer>
    </div>
  );
}

export default App;
