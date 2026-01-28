import { useEffect, useState } from 'react'

type Note = {
  id: string
  title: string
  body: string
  createdAt: string
}

const STORAGE_KEY = 'localforge_notes'

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return []
  }
}

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

function NotesSnippets() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    setNotes(loadNotes())
  }, [])

  const addNote = () => {
    if (!title.trim() && !body.trim()) {
      return
    }
    const note: Note = {
      id: crypto.randomUUID(),
      title: title.trim() || 'Untitled',
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    const next = [note, ...notes]
    setNotes(next)
    saveNotes(next)
    setTitle('')
    setBody('')
  }

  const removeNote = (id: string) => {
    const next = notes.filter((note) => note.id !== id)
    setNotes(next)
    saveNotes(next)
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Notes & Snippets</p>
        <h1>Capture local notes and snippets.</h1>
        <p className="tool-subtitle">
          Keep quick notes and code snippets stored in your browser.
        </p>
      </div>
      <div className="tool-panel">
        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Note</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="button primary" type="button" onClick={addNote}>
            Save Note
          </button>
        </div>
        <div className="list-stack">
          {notes.length === 0 && <p className="form-status">No notes yet.</p>}
          {notes.map((note) => (
            <div key={note.id} className="list-card">
              <div className="list-card-header">
                <div>
                  <p className="panel-title">{note.title}</p>
                  <p className="preview-label">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <button className="button ghost" type="button" onClick={() => removeNote(note.id)}>
                  Delete
                </button>
              </div>
              <pre>{note.body}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NotesSnippets
