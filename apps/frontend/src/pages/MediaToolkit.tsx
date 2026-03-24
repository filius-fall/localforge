import { useState, useEffect } from 'react'
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
  const [gifStartTime, setGifStartTime] = useState('0')
  const [gifDuration, setGifDuration] = useState('5')
  const [gifFps, setGifFps] = useState('15')
  const [gifWidth, setGifWidth] = useState('')
  const [gifHeight, setGifHeight] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [retainFiles, setRetainFiles] = useState(false)
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number>(30)

  // Create session on mount if retainFiles is enabled
  useEffect(() => {
    if (retainFiles && !sessionId) {
      createSession()
    }
  }, [retainFiles])

  const createSession = async () => {
    try {
      const response = await fetch(apiUrl('/api/session/create'), {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setSessionId(data.session_id)
        setSessionExpiresIn(data.expires_in_minutes)
      }
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  const deleteSession = async () => {
    if (!sessionId) return
    try {
      await fetch(apiUrl('/api/session/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      setSessionId(null)
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

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

        <div className="tool-section">
          <h2>Create GIF from Video</h2>
          <form
            className="form"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!file) {
                setError('Select a media file first.')
                return
              }

              await runAction(async () => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('start_time', gifStartTime)
                formData.append('duration', gifDuration)
                formData.append('fps', gifFps)
                if (gifWidth) formData.append('width', gifWidth)
                if (gifHeight) formData.append('height', gifHeight)
                if (sessionId) formData.append('session_id', sessionId)

                const response = await fetch(apiUrl('/api/media/video-to-gif'), {
                  method: 'POST',
                  body: formData,
                })

                if (!response.ok) {
                  const payload = await response.json().catch(() => null)
                  throw new Error(payload?.detail ?? 'Request failed.')
                }

                await downloadResponse(response, 'output.gif')
              })
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>Start time (seconds)</span>
                <input
                  value={gifStartTime}
                  onChange={(event) => setGifStartTime(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Duration (seconds)</span>
                <input
                  value={gifDuration}
                  onChange={(event) => setGifDuration(event.target.value)}
                />
              </label>
              <label className="field">
                <span>FPS</span>
                <input
                  value={gifFps}
                  onChange={(event) => setGifFps(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Width (optional)</span>
                <input
                  value={gifWidth}
                  onChange={(event) => setGifWidth(event.target.value)}
                  placeholder="Auto"
                />
              </label>
              <label className="field">
                <span>Height (optional)</span>
                <input
                  value={gifHeight}
                  onChange={(event) => setGifHeight(event.target.value)}
                  placeholder="Auto"
                />
              </label>
            </div>
            <div className="action-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={retainFiles}
                  onChange={(event) => setRetainFiles(event.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontSize: '0.85rem', textTransform: 'none', letterSpacing: 'normal' }}>
                  Keep files for {sessionExpiresIn} min (faster re-conversion)
                </span>
              </label>
              <button className="button primary" type="submit" disabled={loading}>
                Create GIF & Download
              </button>
            </div>
            {sessionId && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent)' }}>
                <strong>Session active:</strong> Files will be auto-deleted in {sessionExpiresIn} minutes. 
                <button 
                  type="button" 
                  onClick={deleteSession}
                  style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete now
                </button>
              </div>
            )}
          </form>
        </div>

        {status && <p className="form-status">{status}</p>}
        {error && <p className="form-error">{error}</p>}
        {loading && (
          <div className="form-status">
            <span className="loading-spinner">Processing</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default MediaToolkit
