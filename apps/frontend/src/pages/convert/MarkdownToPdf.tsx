import { useState } from 'react'
import { useFileConverter, ConverterStatus } from './converterUtils.tsx'

function MarkdownToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const { convert, state, isBusy } = useFileConverter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    convert('/api/convert/markdown-to-pdf', file, 'converted.pdf')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>Markdown to PDF</h1>
        <p className="tool-subtitle">
          Convert Markdown files (.md) to PDF documents locally.
        </p>
      </div>
      <div className="tool-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Markdown file</span>
            <input
              type="file"
              accept="text/markdown,.md,.markdown"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={isBusy}>
              {isBusy ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
          <ConverterStatus status={state.status} error={state.error} />
        </form>
      </div>
    </section>
  )
}

export default MarkdownToPdf
