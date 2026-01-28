import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

function ColorPicker() {
  const [color, setColor] = useState('#00ff00')
  const [error, setError] = useState<string>('')

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '')
    if (cleanHex.length !== 6) {
      throw new Error('Invalid hex color')
    }

    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('Invalid hex color')
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    if ([r, g, b].some(v => v < 0 || v > 255 || !Number.isInteger(v))) {
      throw new Error('Invalid RGB values')
    }

    const toHex = (value: number) => {
      let hex = value.toString(16)
      while (hex.length < 6) {
        hex = `0${hex}`
      }
      return hex.toUpperCase()
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const handleColorChange = (hex: string) => {
    try {
      const rgb = hexToRgb(hex)
      setColor(rgb)
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const copyToClipboard = async () => {
    try {
      const rgbText = `rgb(${color.r}, ${color.g}, ${color.b})`
      await navigator.clipboard.writeText(rgbText)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Color Picker</h1>
        <p className="tool-subtitle">
          Pick colors and copy hex/rgb values
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>Hex Color</h2>

          <label className="field">
            <span>Hex Color</span>
            <input
              type="text"
              value={color.startsWith('#') ? color : `#${color}`}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#00ff00"
              maxLength={7}
            />
          </label>

          <div className="output-card">
            <p className="preview-label">RGB Value</p>
            <pre>{`rgb(${color.r}, ${color.g}, ${color.b})`}</pre>
          </div>

          <button
            className="button ghost"
            type="button"
            onClick={copyToClipboard}
            disabled={!color.startsWith('#')}
          >
            Copy RGB
          </button>
        </div>

        <div className="tool-section">
          <h2>RGB Input</h2>

          <label className="field">
            <span>R</span>
            <input
              type="number"
              min="0"
              max="255"
              value={color.r !== null ? color.r : ''}
              onChange={(e) => {
                const r = parseInt(e.target.value) || 0
                const newG = color.g !== null ? color.g : 0
                const newB = color.b !== null ? color.b : 0
                const newRgb = { r, g: newG, b: newB }
                try {
                  setColor(newRgb)
                  setError('')
                } catch (err) {
                  setError((err as Error).message)
                }
              }}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.g !== null ? color.g : ''}
              onChange={(e) => {
                const newG = parseInt(e.target.value) || 0
                const newR = color.r !== null ? color.r : 0
                const newB = color.b !== null ? color.b : 0
                const newRgb = { r: newR, g: newG, b: newB }
                try {
                  setColor(newRgb)
                  setError('')
                } catch (err) {
                  setError((err as Error).message)
                }
              }}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.b !== null ? color.b : ''}
              onChange={(e) => {
                const newR = color.r !== null ? color.r : 0
                const newG = color.g !== null ? color.g : 0
                const newB = color.b !== null ? color.b : 0
                const newRgb = { r: newR, g: newG, b: newB }
                try {
                  setColor(newRgb)
                  setError('')
                } catch (err) {
                  setError((err as Error).message)
                }
              }}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.b !== null ? color.b : ''}
              onChange={(e) => {
                const newB = color.b !== null ? color.b : 0
                const newR = color.r !== null ? color.r : 0
                const newRgb = { r: newR, g: newG, b: newB }
                try {
                  setColor(newRgb)
                  setError('')
                } catch (err) {
                  setError((err as Error).message)
                }
              }}
            />
            <div className="output-card">
              <p className="preview-label">Hex Output</p>
              <pre>{color.startsWith('#') ? color : `#${color}`}</pre>
            </div>
            <button
              className="button primary"
              type="button"
              onClick={copyToClipboard}
              disabled={color === null}
            >
              Copy Hex
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default ColorPicker
