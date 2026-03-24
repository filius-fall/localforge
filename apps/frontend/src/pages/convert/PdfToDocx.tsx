import { useState } from 'react'
import { useFileConverter, ConverterStatus } from './converterUtils.tsx'

function PdfToDocx() {
  const [file, setFile] = useState<File | null>(null)
  const { convert, state, isBusy } = useFileConverter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    convert('/api/convert/pdf-to-docx', file, 'converted.docx')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>PDF to DOCX</h1>
        <p className="tool-subtitle">
          Convert PDF documents to Microsoft Word format (.docx) locally.
        </p>
      </div>
      <div className="tool-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>PDF file</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={isBusy}>
              {isBusy ? 'Converting...' : 'Convert to DOCX'}
            </button>
          </div>
          <ConverterStatus status={state.status} error={state.error} />
        </form>
      </div>
    </section>
  )
}

export default PdfToDocx
