import { useEffect, useState } from 'react'
import { readFromClipboard } from '../lib/clipboard'

type ClipboardEntry = {
   id: string
   text: string
   createdAt: string
}

const STORAGE_KEY = 'localforge_clipboard'

const loadEntries = (): ClipboardEntry[] => {
   try {
     const raw = localStorage.getItem(STORAGE_KEY)
     return raw ? (JSON.parse(raw) as ClipboardEntry[]) : []
   } catch {
     return []
   }
}

const saveEntries = (entries: ClipboardEntry[]) => {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function ClipboardHistory() {
   const [entries, setEntries] = useState<ClipboardEntry[]>([])
   const [manualText, setManualText] = useState('')
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
     setEntries(loadEntries())
   }, [])

   const addEntry = (text: string) => {
     const entry = {
       id: crypto.randomUUID(),
       text,
       createdAt: new Date().toISOString(),
     }
     const next = [entry, ...entries].slice(0, 50)
     setEntries(next)
     saveEntries(next)
   }

   const handleReadClipboard = async () => {
     setError(null)
     const text = await readFromClipboard((msg) => setError(msg))
     if (text && text.trim()) {
       addEntry(text)
     }
   }

  const handleAddManual = () => {
    if (!manualText.trim()) {
      return
    }
    addEntry(manualText.trim())
    setManualText('')
  }

  const handleClear = () => {
    setEntries([])
    saveEntries([])
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Clipboard History</p>
        <h1>Keep a local trail of clipboard snippets.</h1>
        <p className="tool-subtitle">
          Capture clipboard entries locally with quick recall.
        </p>
      </div>
      <div className="tool-panel">
        <div className="action-row">
          <button className="button primary" type="button" onClick={handleReadClipboard}>
            Capture Clipboard
          </button>
          <button className="button ghost" type="button" onClick={handleClear}>
            Clear History
          </button>
        </div>
        <label className="field">
          <span>Manual entry</span>
          <textarea value={manualText} onChange={(event) => setManualText(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="button primary" type="button" onClick={handleAddManual}>
            Add Entry
          </button>
        </div>
        <div className="list-stack">
          {entries.length === 0 && <p className="form-status">No entries yet.</p>}
          {entries.map((entry) => (
            <div key={entry.id} className="list-card">
              <p className="preview-label">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
              <pre>{entry.text}</pre>
            </div>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default ClipboardHistory
