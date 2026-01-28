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

function PdfToolkit() {
  const [mergeFiles, setMergeFiles] = useState<FileList | null>(null)
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitRanges, setSplitRanges] = useState('')
  const [rotateFile, setRotateFile] = useState<File | null>(null)
  const [rotateAngle, setRotateAngle] = useState('90')
  const [rotatePages, setRotatePages] = useState('')
  const [optimizeFile, setOptimizeFile] = useState<File | null>(null)
  const [optimizeLevel, setOptimizeLevel] = useState('screen')
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
      setError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleMerge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mergeFiles || mergeFiles.length < 2) {
      setError('Select at least two PDFs to merge.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      Array.from(mergeFiles).forEach((file) => formData.append('files', file))
      const response = await fetch(apiUrl('/api/pdf/merge'), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Merge failed.')
      }
      await downloadResponse(response, 'merged.pdf')
    })
  }

  const handleSplit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!splitFile) {
      setError('Select a PDF to split.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', splitFile)
      if (splitRanges.trim()) {
        formData.append('ranges', splitRanges.trim())
      }
      const response = await fetch(apiUrl('/api/pdf/split'), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Split failed.')
      }
      await downloadResponse(response, 'split-pdfs.zip')
    })
  }

  const handleRotate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rotateFile) {
      setError('Select a PDF to rotate.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', rotateFile)
      formData.append('angle', rotateAngle)
      if (rotatePages.trim()) {
        formData.append('pages', rotatePages.trim())
      }
      const response = await fetch(apiUrl('/api/pdf/rotate'), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Rotate failed.')
      }
      await downloadResponse(response, 'rotated.pdf')
    })
  }

  const handleOptimize = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!optimizeFile) {
      setError('Select a PDF to optimize.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', optimizeFile)
      formData.append('level', optimizeLevel)
      const response = await fetch(apiUrl('/api/pdf/optimize'), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.detail ?? 'Optimize failed.'
        )
      }
      await downloadResponse(response, 'optimized.pdf')
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">PDF Toolkit</p>
        <h1>Merge, split, rotate, and optimize PDFs locally.</h1>
        <p className="tool-subtitle">
          Upload PDFs once and export the exact layout you need.
        </p>
      </div>
      <div className="tool-panel">
        <div className="tool-section">
          <h2>Merge PDFs</h2>
          <form onSubmit={handleMerge} className="form">
            <label className="field">
              <span>Select PDFs</span>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(event) => setMergeFiles(event.target.files)}
              />
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Merge & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Split PDF</h2>
          <form onSubmit={handleSplit} className="form">
            <div className="form-grid">
              <label className="field">
                <span>PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setSplitFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <label className="field">
                <span>Ranges (optional)</span>
                <input
                  value={splitRanges}
                  onChange={(event) => setSplitRanges(event.target.value)}
                  placeholder="1-3,5,8-10"
                />
              </label>
            </div>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Split & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Rotate Pages</h2>
          <form onSubmit={handleRotate} className="form">
            <div className="form-grid">
              <label className="field">
                <span>PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setRotateFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <label className="field">
                <span>Angle</span>
                <select
                  value={rotateAngle}
                  onChange={(event) => setRotateAngle(event.target.value)}
                >
                  <option value="90">90°</option>
                  <option value="180">180°</option>
                  <option value="270">270°</option>
                </select>
              </label>
              <label className="field">
                <span>Pages (optional)</span>
                <input
                  value={rotatePages}
                  onChange={(event) => setRotatePages(event.target.value)}
                  placeholder="2-4,7"
                />
              </label>
            </div>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Rotate & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Optimize PDF</h2>
          <form onSubmit={handleOptimize} className="form">
            <div className="form-grid">
              <label className="field">
                <span>PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setOptimizeFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <label className="field">
                <span>Compression level</span>
                <select
                  value={optimizeLevel}
                  onChange={(event) => setOptimizeLevel(event.target.value)}
                >
                  <option value="screen">Screen (smallest)</option>
                  <option value="ebook">eBook</option>
                  <option value="printer">Printer</option>
                  <option value="prepress">Prepress (best)</option>
                </select>
              </label>
            </div>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Optimize & Download
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

export default PdfToolkit
