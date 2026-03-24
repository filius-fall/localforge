import { useState } from 'react'
import { useFileConverter, ConverterStatus } from './converterUtils.tsx'

function XlsxToCsv() {
  const [file, setFile] = useState<File | null>(null)
  const { convert, state, isBusy } = useFileConverter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    convert('/api/convert/xlsx-to-csv', file, 'converted.csv')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>XLSX to CSV</h1>
        <p className="tool-subtitle">
          Convert Excel spreadsheets (.xlsx) to CSV format locally.
        </p>
      </div>
      <div className="tool-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>XLSX file</span>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={isBusy}>
              {isBusy ? 'Converting...' : 'Convert to CSV'}
            </button>
          </div>
          <ConverterStatus status={state.status} error={state.error} />
        </form>
      </div>
    </section>
  )
}

export default XlsxToCsv
