import { useState } from 'react'

function ColorConverter() {
  const [hexInput, setHexInput] = useState<string>('')
  const [rgbInput, setRgbInput] = useState<string>('')
  const [hexOutput, setHexOutput] = useState<string>('')
  const [rgbOutput, setRgbOutput] = useState<string>('')
  const [error, setError] = useState<string>('')

  const isValidHex = (hex: string): boolean => {
    const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    return hexRegex.test(hex)
  }

  const isValidRgb = (rgb: string): boolean => {
    const rgbRegex = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*[\d.]+)?\s*\)$/
    const match = rgb.match(rgbRegex)
    if (!match) return false

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    return (
      r >= 0 && r <= 255 &&
      g >= 0 && g <= 255 &&
      b >= 0 && b <= 255
    )
  }

  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '')

    let r: number, g: number, b: number

    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16)
      g = parseInt(cleanHex[1] + cleanHex[1], 16)
      b = parseInt(cleanHex[2] + cleanHex[2], 16)
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16)
      g = parseInt(cleanHex.substring(2, 4), 16)
      b = parseInt(cleanHex.substring(4, 6), 16)
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  const rgbToHex = (rgb: string): string => {
    const rgbRegex = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*[\d.]+)?\s*\)$/
    const match = rgb.match(rgbRegex)

    if (!match) {
      return '#000000'
    }

    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')

    return `#${r}${g}${b}`.toUpperCase()
  }

  const convertHexToRgb = () => {
    setError('')

    if (!hexInput.trim()) {
      setRgbOutput('')
      return
    }

    if (!isValidHex(hexInput)) {
      setError('Invalid hex color. Use #RRGGBB or #RGB format.')
      setRgbOutput('')
      return
    }

    try {
      const rgb = hexToRgb(hexInput)
      setRgbOutput(rgb)
    } catch {
      setError('Conversion failed')
      setRgbOutput('')
    }
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

    try {
      const hex = rgbToHex(rgbInput)
      setHexOutput(hex)
    } catch {
      setError('Conversion failed')
      setHexOutput('')
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
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
                value={hexInput.replace('#', '')}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="RRGGBB or RGB"
                className="input"
                maxLength={6}
              />
            </div>
            <p className="form-hint">
              Examples: FF0000, F00, 00FF00
            </p>
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
              <div
                className="color-preview"
                style={{ backgroundColor: rgbOutput }}
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => copyToClipboard(rgbOutput)}
                title="Copy to clipboard"
              >
                📋 Copy
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
            <p className="form-hint">
              Examples: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
            </p>
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
              <div
                className="color-preview"
                style={{ backgroundColor: hexOutput }}
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => copyToClipboard(hexOutput)}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
          )}
        </div>

        {(hexOutput || rgbOutput) && (
          <div className="tool-section">
            <button
              className="button secondary"
              type="button"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default ColorConverter
