import { useEffect, useState, Fragment } from 'react'
import { getJson } from '../lib/api'
import { copyToClipboard } from '../lib/clipboard'

const STORAGE_KEY = 'localforge-decisions'

interface Decision {
   id: string
   title: string
   summary: string
   context: string
   decision: string
   consequences: string
   tags: string[]
   status: string
   date: string
   path: string
   url: string
   commitUrl: string
}

function DecisionLogger() {
   const [title, setTitle] = useState<string>('')
   const [summary, setSummary] = useState<string>('')
   const [context, setContext] = useState<string>('')
   const [decision, setDecision] = useState<string>('')
   const [consequences, setConsequences] = useState<string>('')
   const [tags, setTags] = useState<string[]>([])
   const [status, setStatus] = useState<string>('accepted')
   const [decisions, setDecisions] = useState<Decision[]>([])
   const [error, setError] = useState<string>('')

   // Load decisions from localStorage on mount
   useEffect(() => {
     try {
       const saved = localStorage.getItem(STORAGE_KEY)
       if (saved) {
         const parsed = JSON.parse(saved)
         setDecisions(parsed)
       }
     } catch {
       // Silent fail - storage might be empty
     }
   }, [])

   const saveDecision = async () => {
     setError('')

     if (!title.trim() || !decision.trim()) {
       setError('Title and decision are required')
       return
     }

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      context: context.trim(),
      decision: decision.trim(),
      consequences: consequences.trim(),
      tags: tags.filter(t => t.trim()),
      status: status || 'accepted',
    }

    try {
      const data = await getJson<{ decision: Decision }>('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

       const savedDecision: Decision = data.decision
       const updated = [savedDecision, ...decisions]
       setDecisions(updated)
       localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

       setTitle('')
       setSummary('')
       setContext('')
       setDecision('')
       setConsequences('')
       setTags([])
       setStatus('accepted')
       setError('')
     } catch (err) {
       if (err instanceof Error) {
         setError(err.message)
       } else {
         setError('Failed to save decision')
       }
     }
   }

  const handleCopy = async (text: string) => {
    if (!text) return
    await copyToClipboard(text, (msg) => setError(msg))
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Decision Logger</h1>
        <p className="tool-subtitle">
          Log and track architecture decisions (ADRs)
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>Log New Decision</h2>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Use TypeScript for new components"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-line summary"
              className="input"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="context">Context</label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What led to this decision? What are the constraints?"
              className="input"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="decision">Decision *</label>
            <textarea
              id="decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="What is the change? What is the approach?"
              className="input"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="consequences">Consequences</label>
            <textarea
              id="consequences"
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              placeholder="What are the results? What becomes easier/harder?"
              className="input"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
              placeholder="e.g., infra, auth (comma separated)"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="superseded">Superseded</option>
              <option value="proposed">Proposed</option>
            </select>
          </div>

          <button
            className="button primary"
            type="button"
            onClick={saveDecision}
            disabled={!title.trim() || !decision.trim()}
          >
            Save Decision
          </button>
        </div>

        {decisions.length > 0 && (
          <div className="tool-section">
            <h2>Recent Decisions</h2>
            <div className="decision-list">
              {decisions.map((d) => (
                <div key={d.id} className="decision-item">
                  <div className="decision-header">
                    <h3>{d.title}</h3>
                    <div className="decision-meta">
                      <span className="decision-date">{formatDate(d.date)}</span>
                      {d.status !== 'accepted' && (
                        <span className={`decision-status status-${d.status}`}>{d.status}</span>
                      )}
                    </div>
                  </div>
                  {d.summary && (
                    <div className="decision-section">
                      <h4>Summary</h4>
                      <p>{d.summary}</p>
                    </div>
                  )}
                  {d.context && (
                    <div className="decision-section">
                      <h4>Context</h4>
                      <p>{d.context}</p>
                    </div>
                  )}
                  <div className="decision-section">
                    <h4>Decision</h4>
                    <p>{d.decision}</p>
                  </div>
                  {d.consequences && (
                    <div className="decision-section">
                      <h4>Consequences</h4>
                      <p>{d.consequences}</p>
                    </div>
                  )}
                  {d.tags && d.tags.length > 0 && (
                    <div className="decision-section">
                      <h4>Tags</h4>
                      <p>{d.tags.map((t, i) => (
                        <Fragment key={t}>
                          {i > 0 && ', '}
                          <span className="tag">{t}</span>
                        </Fragment>
                      ))}</p>
                    </div>
                  )}
                  {d.url && (
                    <div className="decision-section">
                      <h4>GitHub</h4>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="external-link">
                        {d.path}
                      </a>
                      <a href={d.commitUrl} target="_blank" rel="noopener noreferrer" className="external-link small">
                        View commit ↗
                      </a>
                    </div>
                  )}
                  <button
                    className="icon-button small"
                    type="button"
                    onClick={() => handleCopy(d.decision)}
                    title="Copy decision"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default DecisionLogger
