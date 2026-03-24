import { useState } from 'react'
import { useFileConverter, ConverterStatus } from './converterUtils.tsx'

function CsvToXlsx() {
  const [file, setFile] = useState<File | null>(null)
  const { convert, state, isBusy } = useFileConverter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    convert('/api/convert/csv-to-xlsx', file, 'converted.xlsx')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>CSV to XLSX</h1>
        <p className="tool-subtitle">
          Convert CSV files to Excel spreadsheet format (.xlsx) locally.
        </p>
      </div>
      <div className="tool-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>CSV file</span>
            <input
              type="file"
              accept="text/csv,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={isBusy}>
              {isBusy ? 'Converting...' : 'Convert to XLSX'}
            </button>
          </div>
          <ConverterStatus status={state.status} error={state.error} />
        </form>
      </div>
    </section>
  )
}

export default CsvToXlsx
