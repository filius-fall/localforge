import { useState } from 'react'
import { useFileConverter, ConverterStatus } from './converterUtils.tsx'

function DocxToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const { convert, state, isBusy } = useFileConverter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    convert('/api/convert/docx-to-pdf', file, 'converted.pdf')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>DOCX to PDF</h1>
        <p className="tool-subtitle">
          Convert Microsoft Word documents (.docx) to PDF format locally.
        </p>
      </div>
      <div className="tool-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>DOCX file</span>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

export default DocxToPdf
