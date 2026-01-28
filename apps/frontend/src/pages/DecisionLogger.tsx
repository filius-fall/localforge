import { useState } from 'react'

interface Decision {
  id: string
  title: string
  context: string
  decision: string
  consequences: string
  date: string
}

function DecisionLogger() {
  const [title, setTitle] = useState<string>('')
  const [context, setContext] = useState<string>('')
  const [decision, setDecision] = useState<string>('')
  const [consequences, setConsequences] = useState<string>('')
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [error, setError] = useState<string>('')

  const saveDecision = () => {
    setError('')

    if (!title.trim() || !decision.trim()) {
      setError('Title and decision are required')
      return
    }

    try {
      const newDecision: Decision = {
        id: Date.now().toString(),
        title: title.trim(),
        context: context.trim(),
        decision: decision.trim(),
        consequences: consequences.trim(),
        date: new Date().toISOString(),
      }

      setDecisions([newDecision, ...decisions])
      setTitle('')
      setContext('')
      setDecision('')
      setConsequences('')

      // Note: In production, this would make an API call to save to GitHub
      // For now, we're storing in state
    } catch {
      setError('Failed to save decision')
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
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
                    <span className="decision-date">{formatDate(d.date)}</span>
                  </div>
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
                  <button
                    className="icon-button small"
                    type="button"
                    onClick={() => copyToClipboard(d.decision)}
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
