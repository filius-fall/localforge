import { useMemo, useState } from 'react'
import Papa from 'papaparse'

const titleCase = (input: string) =>
  input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

function TextUtilities() {
  const [caseInput, setCaseInput] = useState('')
  const [dedupeInput, setDedupeInput] = useState('')
  const [regexPattern, setRegexPattern] = useState('')
  const [regexFlags, setRegexFlags] = useState('g')
  const [regexInput, setRegexInput] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [csvInput, setCsvInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [csvOutput, setCsvOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dedupedLines = useMemo(() => {
    const lines = dedupeInput.split('\n').map((line) => line.trim())
    const seen = new Set<string>()
    const result: string[] = []
    lines.forEach((line) => {
      if (line && !seen.has(line)) {
        seen.add(line)
        result.push(line)
      }
    })
    return result.join('\n')
  }, [dedupeInput])

  const regexMatches = useMemo(() => {
    if (!regexPattern) {
      return []
    }
    try {
      const regex = new RegExp(regexPattern, regexFlags)
      return Array.from(regexInput.matchAll(regex)).map((match) => match[0])
    } catch {
      return []
    }
  }, [regexInput, regexPattern, regexFlags])

  const handleJsonToCsv = () => {
    setError(null)
    try {
      const data = JSON.parse(jsonInput)
      const csv = Papa.unparse(data)
      setCsvOutput(csv)
    } catch (err) {
      setError('Invalid JSON input.')
    }
  }

  const handleCsvToJson = () => {
    setError(null)
    const parsed = Papa.parse(csvInput, { header: true })
    if (parsed.errors.length) {
      setError('Invalid CSV input.')
      return
    }
    setJsonOutput(JSON.stringify(parsed.data, null, 2))
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Text Utilities</p>
        <h1>Clean, transform, and inspect text quickly.</h1>
        <p className="tool-subtitle">
          Handle case conversion, line dedupe, regex tests, and JSON/CSV transforms.
        </p>
      </div>
      <div className="tool-panel">
        <div className="tool-section">
          <h2>Case Converter</h2>
          <label className="field">
            <span>Input</span>
            <textarea value={caseInput} onChange={(event) => setCaseInput(event.target.value)} />
          </label>
          <div className="output-grid">
            <div className="output-card">
              <p className="preview-label">UPPERCASE</p>
              <pre>{caseInput.toUpperCase()}</pre>
            </div>
            <div className="output-card">
              <p className="preview-label">lowercase</p>
              <pre>{caseInput.toLowerCase()}</pre>
            </div>
            <div className="output-card">
              <p className="preview-label">Title Case</p>
              <pre>{titleCase(caseInput)}</pre>
            </div>
          </div>
        </div>

        <div className="tool-section">
          <h2>Remove Duplicate Lines</h2>
          <label className="field">
            <span>Lines</span>
            <textarea value={dedupeInput} onChange={(event) => setDedupeInput(event.target.value)} />
          </label>
          <div className="output-card">
            <p className="preview-label">Unique Lines</p>
            <pre>{dedupedLines}</pre>
          </div>
        </div>

        <div className="tool-section">
          <h2>Regex Tester</h2>
          <div className="form-grid">
            <label className="field">
              <span>Pattern</span>
              <input
                value={regexPattern}
                onChange={(event) => setRegexPattern(event.target.value)}
                placeholder="\\b[a-z]+\\b"
              />
            </label>
            <label className="field">
              <span>Flags</span>
              <input value={regexFlags} onChange={(event) => setRegexFlags(event.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Text</span>
            <textarea value={regexInput} onChange={(event) => setRegexInput(event.target.value)} />
          </label>
          <div className="output-card">
            <p className="preview-label">Matches ({regexMatches.length})</p>
            <pre>{regexMatches.join('\n') || 'No matches'}</pre>
          </div>
        </div>

        <div className="tool-section">
          <h2>JSON ↔ CSV</h2>
          <div className="form-grid">
            <label className="field">
              <span>JSON input</span>
              <textarea value={jsonInput} onChange={(event) => setJsonInput(event.target.value)} />
            </label>
            <label className="field">
              <span>CSV input</span>
              <textarea value={csvInput} onChange={(event) => setCsvInput(event.target.value)} />
            </label>
          </div>
          <div className="action-row">
            <button className="button primary" type="button" onClick={handleJsonToCsv}>
              JSON → CSV
            </button>
            <button className="button ghost" type="button" onClick={handleCsvToJson}>
              CSV → JSON
            </button>
          </div>
          <div className="output-grid">
            <div className="output-card">
              <p className="preview-label">CSV output</p>
              <pre>{csvOutput}</pre>
            </div>
            <div className="output-card">
              <p className="preview-label">JSON output</p>
              <pre>{jsonOutput}</pre>
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default TextUtilities
