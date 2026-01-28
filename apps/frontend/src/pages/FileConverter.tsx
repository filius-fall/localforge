import { useState } from 'react'
import { apiUrl } from '../lib/api'

const parseFilename = (response: Response, fallback: string) => {
  const header = response.headers.get('content-disposition')
  if (!header) {
    return fallback
  }
  const match = header.match(/filename="?([^";]+)"?/)
  return match?.[1] ?? fallback
}

const downloadResponse = async (response: Response, fallback: string) => {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = parseFilename(response, fallback)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function FileConverter() {
  const [docxFile, setDocxFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [xlsxFile, setXlsxFile] = useState<File | null>(null)
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const runAction = async (action: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      await action()
      setStatus('Done. Download started.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  const uploadAndConvert = async (
    endpoint: string,
    file: File | null,
    fallback: string
  ) => {
    if (!file) {
      setError('Select a file first.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Failed.')
      }
      await downloadResponse(response, fallback)
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>Convert documents and data locally.</h1>
        <p className="tool-subtitle">
          DOCX, PDF, CSV, XLSX, and Markdown conversions with one click.
        </p>
      </div>
      <div className="tool-panel">
        <div className="tool-section">
          <h2>DOCX → PDF</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert('/api/convert/docx-to-pdf', docxFile, 'converted.pdf')
            }}
          >
            <label className="field">
              <span>DOCX file</span>
              <input
                type="file"
                accept=".docx"
                onChange={(event) => setDocxFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert to PDF
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>PDF → DOCX</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert('/api/convert/pdf-to-docx', pdfFile, 'converted.docx')
            }}
          >
            <label className="field">
              <span>PDF file</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert to DOCX
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>CSV → XLSX</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert('/api/convert/csv-to-xlsx', csvFile, 'converted.xlsx')
            }}
          >
            <label className="field">
              <span>CSV file</span>
              <input
                type="file"
                accept="text/csv"
                onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert to XLSX
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>XLSX → CSV</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert('/api/convert/xlsx-to-csv', xlsxFile, 'converted.csv')
            }}
          >
            <label className="field">
              <span>XLSX file</span>
              <input
                type="file"
                accept=".xlsx"
                onChange={(event) => setXlsxFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert to CSV
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Markdown → PDF</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert('/api/convert/markdown-to-pdf', markdownFile, 'converted.pdf')
            }}
          >
            <label className="field">
              <span>Markdown file</span>
              <input
                type="file"
                accept="text/markdown,.md"
                onChange={(event) => setMarkdownFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert to PDF
              </button>
            </div>
          </form>
        </div>

        {status && <p className="form-status">{status}</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default FileConverter
