import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'

const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
]

const downloadName = (originalName: string, format: string) => {
  const base = originalName.replace(/\.[^/.]+$/, '') || 'image'
  const extension = format === 'jpeg' ? 'jpg' : format
  return `${base}.${extension}`
}

function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState('png')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError('Please choose an image to convert.')
      return
    }

    setLoading(true)
    setError(null)
    setStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('target_format', targetFormat)

      const response = await fetch(apiUrl('/api/image/convert'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.detail ?? 'Conversion failed.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadName(file.name, targetFormat)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus('Conversion complete. Download started.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Image Converter</p>
        <h1>Transform images for any workflow.</h1>
        <p className="tool-subtitle">
          Upload once, export in the format that fits your next step.
        </p>
      </div>
      <div className="tool-panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label className="field">
              <span>Choose image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
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
          </div>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Converting...' : 'Convert & Download'}
            </button>
          </div>
        </form>
        {previewUrl && (
          <div className="preview-card">
            <p className="preview-label">Preview</p>
            <div className="preview-frame">
              <img src={previewUrl} alt="Selected preview" />
            </div>
          </div>
        )}
        {status && <p className="form-status">{status}</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default ImageConverter
