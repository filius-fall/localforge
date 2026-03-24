import { useState } from 'react'
import { apiUrl } from '../lib/api'
import { useOperationStatus, type OperationStatus } from '../lib/useOperationStatus'

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

// Status indicator component
function StatusIndicator({ status, error }: { status: OperationStatus; error: string | null }) {
  if (status === 'idle') return null

  const statusConfig = {
    uploading: { icon: '⬆️', text: 'Uploading...' },
    processing: { icon: '⚙️', text: 'Processing...' },
    downloading: { icon: '⬇️', text: 'Downloading...' },
    success: { icon: '✅', text: 'Done! Download started.' },
    error: { icon: '❌', text: error || 'Failed.' },
  }

  const config = statusConfig[status]
  const isError = status === 'error'

  return (
    <div className={`operation-status ${isError ? 'error' : ''}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.text}</span>
    </div>
  )
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

  // Individual operation states
  const mergeOp = useOperationStatus()
  const splitOp = useOperationStatus()
  const rotateOp = useOperationStatus()
  const optimizeOp = useOperationStatus()

  const handleMerge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mergeFiles || mergeFiles.length < 2) {
      mergeOp.update('error', 'Select at least two PDFs to merge.')
      return
    }

    await mergeOp.run({
      upload: async () => {
        const formData = new FormData()
        Array.from(mergeFiles).forEach((file) => formData.append('files', file))
        const response = await fetch(apiUrl('/api/pdf/merge'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Merge failed.')
        }
        return response
      },
      process: async () => {
        // Processing happens server-side during upload
      },
      download: async () => {
        const formData = new FormData()
        Array.from(mergeFiles).forEach((file) => formData.append('files', file))
        const response = await fetch(apiUrl('/api/pdf/merge'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Merge failed.')
        await downloadResponse(response, 'merged.pdf')
      },
    })
  }

  const handleSplit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!splitFile) {
      splitOp.update('error', 'Select a PDF to split.')
      return
    }

    await splitOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', splitFile)
        if (splitRanges.trim()) formData.append('ranges', splitRanges.trim())
        const response = await fetch(apiUrl('/api/pdf/split'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Split failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', splitFile)
        if (splitRanges.trim()) formData.append('ranges', splitRanges.trim())
        const response = await fetch(apiUrl('/api/pdf/split'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Split failed.')
        await downloadResponse(response, 'split-pdfs.zip')
      },
    })
  }

  const handleRotate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rotateFile) {
      rotateOp.update('error', 'Select a PDF to rotate.')
      return
    }

    await rotateOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', rotateFile)
        formData.append('angle', rotateAngle)
        if (rotatePages.trim()) formData.append('pages', rotatePages.trim())
        const response = await fetch(apiUrl('/api/pdf/rotate'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Rotate failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', rotateFile)
        formData.append('angle', rotateAngle)
        if (rotatePages.trim()) formData.append('pages', rotatePages.trim())
        const response = await fetch(apiUrl('/api/pdf/rotate'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Rotate failed.')
        await downloadResponse(response, 'rotated.pdf')
      },
    })
  }

  const handleOptimize = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!optimizeFile) {
      optimizeOp.update('error', 'Select a PDF to optimize.')
      return
    }

    await optimizeOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', optimizeFile)
        formData.append('level', optimizeLevel)
        const response = await fetch(apiUrl('/api/pdf/optimize'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Optimize failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', optimizeFile)
        formData.append('level', optimizeLevel)
        const response = await fetch(apiUrl('/api/pdf/optimize'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Optimize failed.')
        await downloadResponse(response, 'optimized.pdf')
      },
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
              <button
                className="button primary"
                type="submit"
                disabled={mergeOp.isBusy}
              >
                {mergeOp.isBusy ? 'Merging...' : 'Merge & Download'}
              </button>
            </div>
            <StatusIndicator status={mergeOp.state.status} error={mergeOp.state.error} />
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
              <button
                className="button primary"
                type="submit"
                disabled={splitOp.isBusy}
              >
                {splitOp.isBusy ? 'Splitting...' : 'Split & Download'}
              </button>
            </div>
            <StatusIndicator status={splitOp.state.status} error={splitOp.state.error} />
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
              <button
                className="button primary"
                type="submit"
                disabled={rotateOp.isBusy}
              >
                {rotateOp.isBusy ? 'Rotating...' : 'Rotate & Download'}
              </button>
            </div>
            <StatusIndicator status={rotateOp.state.status} error={rotateOp.state.error} />
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
              <button
                className="button primary"
                type="submit"
                disabled={optimizeOp.isBusy}
              >
                {optimizeOp.isBusy ? 'Optimizing...' : 'Optimize & Download'}
              </button>
            </div>
            <StatusIndicator status={optimizeOp.state.status} error={optimizeOp.state.error} />
          </form>
        </div>
      </div>
    </section>
  )
}

export default PdfToolkit
