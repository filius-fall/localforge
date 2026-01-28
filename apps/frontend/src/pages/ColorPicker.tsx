import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { copyToClipboard } from '../lib/clipboard'

type RgbColor = {
  r: number
  g: number
  b: number
}

const clampChannel = (value: number) => Math.max(0, Math.min(255, value))

const rgbToHex = (rgb: RgbColor) => {
  const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

const hexToRgb = (hexValue: string): RgbColor | null => {
  const cleanHex = hexValue.replace('#', '').trim()
  const isValidHex = /^[0-9a-fA-F]{3}$/.test(cleanHex) || /^[0-9a-fA-F]{6}$/.test(cleanHex)
  if (!isValidHex) {
    return null
  }

  const expanded =
    cleanHex.length ===3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)

  return { r, g, b }
}

  const expanded =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)

  return { r, g, b }
}

function ColorPicker() {
  const [hex, setHex] = useState('#00ff00')
  const [rgb, setRgb] = useState<RgbColor>({ r: 0, g:255, b: 0 })
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState<string>('')
  const [hexCopied, setHexCopied] = useState<string>('')
  const [rgbCopied, setRgbCopied] = useState<string>('')

  const handleHexChange = (value: string) => {
    const nextHex = value.startsWith('#') ? value : `#${value}`
    setHex(nextHex.toLowerCase())

    const parsed = hexToRgb(nextHex)
    if (parsed) {
      setRgb(parsed)
      setError('')
    } else if (value.trim().length > 0) {
      setError('Invalid hex color')
    } else {
      setError('')
    }
  }

  const handleRgbChange = (channel: keyof RgbColor, value: string) => {
    const nextValue = Number(value)
    const nextRgb = {
      ...rgb,
      [channel]: Number.isNaN(nextValue) ? 0 : clampChannel(nextValue),
    }

    setRgb(nextRgb)
    setHex(rgbToHex(nextRgb))
    setError('')
  }

  const handleCopyHex = async () => {
    const success = await copyToClipboard(hex, (msg) => setError(msg))
    if (success) {
      setHexCopied('Copied!')
      setTimeout(() => setHexCopied(''), 2000)
    }
  }

  const handleCopyRgb = async () => {
    const rgbText = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    const success = await copyToClipboard(rgbText, (msg) => setError(msg))
    if (success) {
      setRgbCopied('Copied!')
      setTimeout(() => setRgbCopied(''), 2000)
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Color Picker</h1>
        <p className="tool-subtitle">
          Pick colors and copy hex/rgb values.
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>Hex Color</h2>
          <div className="form-group">
            <label htmlFor="hex-input">Hex Color</label>
            <input
              id="hex-input"
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#00ff00"
              maxLength={7}
              className="input"
            />
          </div>

          <HexColorPicker color={hex} onChange={handleHexChange} />

           <div className="output-card">
             <p className="preview-label">RGB Value</p>
             <pre>{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</pre>
           </div>

          <button
            className="button primary"
            type="button"
            onClick={handleCopyHex}
            disabled={!hex}
          >
            Copy Hex
          </button>
          {hexCopied && <p className="form-status">{hexCopied}</p>}
        </div>

        <div className="tool-section">
          <h2>RGB Input</h2>
          <div className="rgb-inputs">
            <div className="form-group">
              <label htmlFor="rgb-r">R</label>
              <input
                id="rgb-r"
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="rgb-g">G</label>
              <input
                id="rgb-g"
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="rgb-b">B</label>
              <input
                id="rgb-b"
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="output-card">
            <p className="preview-label">Hex Output</p>
            <pre>{hex}</pre>
          </div>

          <button
            className="button primary"
            type="button"
            onClick={handleCopyRgb}
            disabled={!hex}
          >
            Copy RGB
          </button>
          {rgbCopied && <p className="form-status">{rgbCopied}</p>}
        </div>

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default ColorPicker
