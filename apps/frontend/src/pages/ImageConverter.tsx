import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'
import { useOperationStatus, type OperationStatus } from '../lib/useOperationStatus'

const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
]

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

function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState('png')
  const [resizeWidth, setResizeWidth] = useState('')
  const [resizeHeight, setResizeHeight] = useState('')
  const [cropX, setCropX] = useState('0')
  const [cropY, setCropY] = useState('0')
  const [cropWidth, setCropWidth] = useState('300')
  const [cropHeight, setCropHeight] = useState('300')
  const [watermarkText, setWatermarkText] = useState('LocalForge')

  // Individual operation states
  const convertOp = useOperationStatus()
  const resizeOp = useOperationStatus()
  const cropOp = useOperationStatus()
  const watermarkOp = useOperationStatus()
  const stripExifOp = useOperationStatus()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const submitForm = async (
    endpoint: string,
    fields: Record<string, string>,
    fallback: string,
    operation: ReturnType<typeof useOperationStatus>
  ) => {
    if (!file) {
      operation.update('error', 'Please choose an image first.')
      return
    }

    await operation.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
        const response = await fetch(apiUrl(endpoint), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.detail ?? 'Request failed.')
        }
      },
      process: async () => {
        // Server handles processing
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
        const response = await fetch(apiUrl(endpoint), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Request failed.')
        await downloadResponse(response, fallback)
      },
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Image Toolkit</p>
        <h1>Edit and export images without leaving your machine.</h1>
        <p className="tool-subtitle">
          Convert formats, resize, crop, watermark, and strip metadata.
        </p>
      </div>
      <div className="tool-panel">
        <label className="field">
          <span>Choose image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="tool-section">
          <h2>Convert Format</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              submitForm('/api/image/convert', { target_format: targetFormat }, 'converted.png', convertOp)
            }}
          >
            <label className="field">
              <span>Target format</span>
              <select
                value={targetFormat}
                onChange={(event) => setTargetFormat(event.target.value)}
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="action-row">
              <button
                className="button primary"
                type="submit"
                disabled={convertOp.isBusy}
              >
                {convertOp.isBusy ? 'Converting...' : 'Convert & Download'}
              </button>
            </div>
            <StatusIndicator status={convertOp.state.status} error={convertOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Resize</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              submitForm(
                '/api/image/resize',
                { width: resizeWidth, height: resizeHeight, target_format: targetFormat },
                'resized.png',
                resizeOp
              )
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>Width (px)</span>
                <input value={resizeWidth} onChange={(event) => setResizeWidth(event.target.value)} />
              </label>
              <label className="field">
                <span>Height (px)</span>
                <input value={resizeHeight} onChange={(event) => setResizeHeight(event.target.value)} />
              </label>
            </div>
            <div className="action-row">
              <button
                className="button primary"
                type="submit"
                disabled={resizeOp.isBusy}
              >
                {resizeOp.isBusy ? 'Resizing...' : 'Resize & Download'}
              </button>
            </div>
            <StatusIndicator status={resizeOp.state.status} error={resizeOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Crop</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              submitForm(
                '/api/image/crop',
                {
                  x: cropX,
                  y: cropY,
                  width: cropWidth,
                  height: cropHeight,
                  target_format: targetFormat,
                },
                'cropped.png',
                cropOp
              )
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>X</span>
                <input value={cropX} onChange={(event) => setCropX(event.target.value)} />
              </label>
              <label className="field">
                <span>Y</span>
                <input value={cropY} onChange={(event) => setCropY(event.target.value)} />
              </label>
              <label className="field">
                <span>Width</span>
                <input value={cropWidth} onChange={(event) => setCropWidth(event.target.value)} />
              </label>
              <label className="field">
                <span>Height</span>
                <input value={cropHeight} onChange={(event) => setCropHeight(event.target.value)} />
              </label>
            </div>
            <div className="action-row">
              <button
                className="button primary"
                type="submit"
                disabled={cropOp.isBusy}
              >
                {cropOp.isBusy ? 'Cropping...' : 'Crop & Download'}
              </button>
            </div>
            <StatusIndicator status={cropOp.state.status} error={cropOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Watermark</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              submitForm(
                '/api/image/watermark',
                { text: watermarkText, target_format: targetFormat },
                'watermarked.png',
                watermarkOp
              )
            }}
          >
            <label className="field">
              <span>Watermark text</span>
              <input
                value={watermarkText}
                onChange={(event) => setWatermarkText(event.target.value)}
              />
            </label>
            <div className="action-row">
              <button
                className="button primary"
                type="submit"
                disabled={watermarkOp.isBusy}
              >
                {watermarkOp.isBusy ? 'Applying...' : 'Apply Watermark'}
              </button>
            </div>
            <StatusIndicator status={watermarkOp.state.status} error={watermarkOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Strip EXIF</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              submitForm(
                '/api/image/strip-exif',
                { target_format: targetFormat },
                'clean.png',
                stripExifOp
              )
            }}
          >
            <div className="action-row">
              <button
                className="button primary"
                type="submit"
                disabled={stripExifOp.isBusy}
              >
                {stripExifOp.isBusy ? 'Stripping...' : 'Strip Metadata'}
              </button>
            </div>
            <StatusIndicator status={stripExifOp.state.status} error={stripExifOp.state.error} />
          </form>
        </div>

        {previewUrl && (
          <div className="preview-card">
            <p className="preview-label">Preview</p>
            <div className="preview-frame">
              <img src={previewUrl} alt="Selected preview" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ImageConverter
