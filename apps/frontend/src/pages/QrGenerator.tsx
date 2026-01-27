import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

function QrGenerator() {
  const [value, setValue] = useState('https://localforge.local')
  const [size, setSize] = useState('240')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setError(null)
    QRCode.toDataURL(value, { width: Number(size) || 240, margin: 2 })
      .then((url) => {
        if (active) {
          setDataUrl(url)
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not generate QR code.')
          setDataUrl(null)
        }
      })
    return () => {
      active = false
    }
  }, [value, size])

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">QR Generator</p>
        <h1>Generate QR codes instantly.</h1>
        <p className="tool-subtitle">
          Create shareable QR codes for links, text, or Wi-Fi details.
        </p>
      </div>
      <div className="tool-panel">
        <div className="form-grid">
          <label className="field">
            <span>QR content</span>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={4}
            />
          </label>
          <label className="field">
            <span>Size (px)</span>
            <input value={size} onChange={(event) => setSize(event.target.value)} />
          </label>
        </div>
        {dataUrl && (
          <div className="preview-card">
            <p className="preview-label">QR Preview</p>
            <div className="preview-frame">
              <img src={dataUrl} alt="QR preview" />
            </div>
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default QrGenerator
