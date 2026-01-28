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

function MediaToolkit() {
  const [file, setFile] = useState<File | null>(null)
  const [convertFormat, setConvertFormat] = useState('mp4')
  const [audioFormat, setAudioFormat] = useState('mp3')
  const [trimStart, setTrimStart] = useState('0')
  const [trimEnd, setTrimEnd] = useState('10')
  const [compressFormat, setCompressFormat] = useState('mp4')
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

  const uploadAndConvert = async (
    endpoint: string,
    fields: Record<string, string>,
    fallback: string
  ) => {
    if (!file) {
      setError('Select a media file first.')
      return
    }
    await runAction(async () => {
      const formData = new FormData()
      formData.append('file', file)
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Failed.')
      }
      await downloadResponse(response, fallback)
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Video & Audio</p>
        <h1>Trim, convert, and compress media locally.</h1>
        <p className="tool-subtitle">
          Keep files local while you format, extract, and reduce size.
        </p>
      </div>
      <div className="tool-panel">
        <label className="field">
          <span>Media file</span>
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="tool-section">
          <h2>Convert Format</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert(
                '/api/media/convert',
                { target_format: convertFormat },
                `converted.${convertFormat}`
              )
            }}
          >
            <label className="field">
              <span>Target format</span>
              <select
                value={convertFormat}
                onChange={(event) => setConvertFormat(event.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="m4a">M4A</option>
              </select>
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Convert & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Extract Audio</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert(
                '/api/media/extract-audio',
                { target_format: audioFormat },
                `audio.${audioFormat}`
              )
            }}
          >
            <label className="field">
              <span>Audio format</span>
              <select
                value={audioFormat}
                onChange={(event) => setAudioFormat(event.target.value)}
              >
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="m4a">M4A</option>
                <option value="aac">AAC</option>
              </select>
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Extract & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Trim Clip</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert(
                '/api/media/trim',
                { start: trimStart, end: trimEnd, target_format: convertFormat },
                `trimmed.${convertFormat}`
              )
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>Start (seconds)</span>
                <input
                  value={trimStart}
                  onChange={(event) => setTrimStart(event.target.value)}
                />
              </label>
              <label className="field">
                <span>End (seconds)</span>
                <input value={trimEnd} onChange={(event) => setTrimEnd(event.target.value)} />
              </label>
              <label className="field">
                <span>Output format</span>
                <select
                  value={convertFormat}
                  onChange={(event) => setConvertFormat(event.target.value)}
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                </select>
              </label>
            </div>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Trim & Download
              </button>
            </div>
          </form>
        </div>

        <div className="tool-section">
          <h2>Compress Media</h2>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault()
              uploadAndConvert(
                '/api/media/compress',
                { target_format: compressFormat },
                `compressed.${compressFormat}`
              )
            }}
          >
            <label className="field">
              <span>Target format</span>
              <select
                value={compressFormat}
                onChange={(event) => setCompressFormat(event.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </select>
            </label>
            <div className="action-row">
              <button className="button primary" type="submit" disabled={loading}>
                Compress & Download
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

export default MediaToolkit
