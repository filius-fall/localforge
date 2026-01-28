import { useState, useRef } from 'react'

interface PaletteColor {
  hex: string
  rgb: string
}

function PaletteGenerator() {
  const [palette, setPalette] = useState<PaletteColor[]>([])
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const extractDominantColors = (canvas: HTMLCanvasElement, colorCount: number = 8): PaletteColor[] => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return []

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Build color frequency map
    const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>()

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      // Skip transparent pixels
      if (a < 128) continue

      // Quantize colors (reduce to nearest 10 for better grouping)
      const quantizedR = Math.round(r / 10) * 10
      const quantizedG = Math.round(g / 10) * 10
      const quantizedB = Math.round(b / 10) * 10

      const key = `${quantizedR},${quantizedG},${quantizedB}`

      if (colorMap.has(key)) {
        const existing = colorMap.get(key)!
        existing.count++
      } else {
        colorMap.set(key, { count: 1, r: quantizedR, g: quantizedG, b: quantizedB })
      }
    }

    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, colorCount)

    return sortedColors.map(color => ({
      hex: rgbToHex(color.r, color.g, color.b),
      rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }

    try {
      setError('')
      const reader = new FileReader()

      reader.onload = (event) => {
        const url = event.target?.result as string
        setPreviewUrl(url)

        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return

          // Set canvas size (limit to 200x200 for performance)
          const maxSize = 200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) return

          ctx.drawImage(img, 0, 0, width, height)

          const colors = extractDominantColors(canvas)
          setPalette(colors)
        }
        img.src = url
      }

      reader.readAsDataURL(file)
    } catch {
      setError('Failed to process image')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const clearPalette = () => {
    setPalette([])
    setPreviewUrl('')
    setError('')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Palette Generator</h1>
        <p className="tool-subtitle">
          Extract dominant color palettes from images
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <div className="form-group">
            <label htmlFor="image-upload">Upload Image</label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="input"
            />
          </div>
          {previewUrl && (
            <div className="button-row">
              <button
                className="button secondary"
                type="button"
                onClick={clearPalette}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="tool-section">
            <h2>Preview</h2>
            <img
              src={previewUrl}
              alt="Uploaded preview"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            />
          </div>
        )}

        {palette.length > 0 && (
          <div className="tool-section">
            <h2>Color Palette</h2>
            <div className="palette-grid">
              {palette.map((color, index) => (
                <div key={index} className="palette-color">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                    title="Click to copy hex"
                  />
                  <div className="color-info">
                    <div className="color-value">{color.hex}</div>
                    <div className="color-value small">{color.rgb}</div>
                    <button
                      className="icon-button small"
                      type="button"
                      onClick={() => copyToClipboard(color.hex)}
                      title="Copy hex"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>

      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </section>
  )
}

export default PaletteGenerator
