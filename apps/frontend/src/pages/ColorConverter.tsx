import { useState } from 'react'
import { copyToClipboard } from '../lib/clipboard'

const normalizeHex = (value: string) => value.replace('#', '').trim()

const isValidHex = (hex: string) => /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)

const hexToRgb = (hex: string) => {
  const cleanHex = normalizeHex(hex)
  const expanded = cleanHex.length === 3
    ? cleanHex.split('').map((char) => char + char).join('')
    : cleanHex

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)

  return `rgb(${r}, ${g}, ${b})`
}

const isValidRgb = (rgb: string) => {
  const match = rgb.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*[\d.]+)?\s*\)$/)
  if (!match) return false

  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])

  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255
}

const rgbToHex = (rgb: string) => {
  const match = rgb.match(/\d+/g)
  if (!match || match.length < 3) return '#000000'

  const toHex = (value: string) => Number(value).toString(16).padStart(2, '0')
  return `#${toHex(match[0])}${toHex(match[1])}${toHex(match[2])}`.toUpperCase()
}

function ColorConverter() {
  const [hexInput, setHexInput] = useState('')
  const [rgbInput, setRgbInput] = useState('')
  const [hexOutput, setHexOutput] = useState('')
  const [rgbOutput, setRgbOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const convertHexToRgb = () => {
    setError('')

    const normalized = normalizeHex(hexInput)
    if (!normalized) {
      setRgbOutput('')
      return
    }

    if (!isValidHex(normalized)) {
      setError('Invalid hex color. Use #RRGGBB or #RGB format.')
      setRgbOutput('')
      return
    }

    setRgbOutput(hexToRgb(normalized))
  }

  const convertRgbToHex = () => {
    setError('')

    if (!rgbInput.trim()) {
      setHexOutput('')
      return
    }

    if (!isValidRgb(rgbInput)) {
      setError('Invalid RGB color. Use rgb(r, g, b) or rgba(r, g, b, a) format.')
      setHexOutput('')
      return
    }

    setHexOutput(rgbToHex(rgbInput))
  }

  const copyHex = async () => {
    if (!hexOutput) return
    const success = await copyToClipboard(hexOutput, (msg) => setError(msg))
    if (success) {
      setCopied('Copied!')
      setTimeout(() => setCopied(''), 2000)
    }
  }

  const copyRgb = async () => {
    if (!rgbOutput) return
    const success = await copyToClipboard(rgbOutput, (msg) => setError(msg))
    if (success) {
      setCopied('Copied!')
      setTimeout(() => setCopied(''), 2000)
    }
  }

  const clearAll = () => {
    setHexInput('')
    setRgbInput('')
    setHexOutput('')
    setRgbOutput('')
    setError('')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Color Converter</h1>
        <p className="tool-subtitle">
          Convert colors between HEX and RGB formats
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>HEX to RGB</h2>
          <div className="form-group">
            <label htmlFor="hex-input">HEX Color</label>
            <div className="input-group">
              <span className="input-prefix">#</span>
              <input
                id="hex-input"
                type="text"
                value={normalizeHex(hexInput)}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="RRGGBB or RGB"
                className="input"
                maxLength={6}
              />
            </div>
            <p className="form-hint">Examples: FF0000, F00, 00FF00</p>
          </div>

          <button
            className="button primary"
            type="button"
            onClick={convertHexToRgb}
            disabled={!hexInput}
          >
            Convert
          </button>

          {rgbOutput && (
            <div className="result-display">
              <div className="result-value">{rgbOutput}</div>
              <div className="color-preview" style={{ backgroundColor: rgbOutput }} />
              <button className="icon-button" type="button" onClick={copyRgb} title="Copy to clipboard">
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="tool-section">
          <h2>RGB to HEX</h2>
          <div className="form-group">
            <label htmlFor="rgb-input">RGB Color</label>
            <input
              id="rgb-input"
              type="text"
              value={rgbInput}
              onChange={(e) => setRgbInput(e.target.value)}
              placeholder="rgb(r, g, b) or rgba(r, g, b, a)"
              className="input"
            />
            <p className="form-hint">Examples: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)</p>
          </div>

          <button
            className="button primary"
            type="button"
            onClick={convertRgbToHex}
            disabled={!rgbInput}
          >
            Convert
          </button>

          {hexOutput && (
            <div className="result-display">
              <div className="result-value">{hexOutput}</div>
              <div className="color-preview" style={{ backgroundColor: hexOutput }} />
              <button className="icon-button" type="button" onClick={copyHex} title="Copy to clipboard">
                Copy
              </button>
            </div>
          )}
        </div>

        {(hexOutput || rgbOutput) && (
          <div className="tool-section">
            <button className="button secondary" type="button" onClick={clearAll}>
              Clear All
            </button>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
        {copied && <p className="form-status">{copied}</p>}
      </div>
    </section>
  )
}

export default ColorConverter
