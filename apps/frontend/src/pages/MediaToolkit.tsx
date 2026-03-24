import { useState, useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { useOperationStatus, type OperationStatus } from '../lib/useOperationStatus'

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
    processing: { icon: '⚙️', text: 'Converting...' },
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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [retainFiles, setRetainFiles] = useState(false)
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number>(30)

  // Individual operation states
  const convertOp = useOperationStatus()
  const extractOp = useOperationStatus()
  const trimOp = useOperationStatus()
  const compressOp = useOperationStatus()
  const gifOp = useOperationStatus()

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

  const handleConvert = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      convertOp.update('error', 'Select a media file first.')
      return
    }

    await convertOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', convertFormat)
        const response = await fetch(apiUrl('/api/media/convert'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Convert failed.')
        }
      },
      process: async () => {
        // Server handles processing during upload
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', convertFormat)
        const response = await fetch(apiUrl('/api/media/convert'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Convert failed.')
        await downloadResponse(response, `converted.${convertFormat}`)
      },
    })
  }

  const handleExtractAudio = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      extractOp.update('error', 'Select a media file first.')
      return
    }

    await extractOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', audioFormat)
        const response = await fetch(apiUrl('/api/media/extract-audio'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Extract failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', audioFormat)
        const response = await fetch(apiUrl('/api/media/extract-audio'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Extract failed.')
        await downloadResponse(response, `audio.${audioFormat}`)
      },
    })
  }

  const handleTrim = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      trimOp.update('error', 'Select a media file first.')
      return
    }

    await trimOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('start', trimStart)
        formData.append('end', trimEnd)
        formData.append('target_format', convertFormat)
        const response = await fetch(apiUrl('/api/media/trim'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Trim failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('start', trimStart)
        formData.append('end', trimEnd)
        formData.append('target_format', convertFormat)
        const response = await fetch(apiUrl('/api/media/trim'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Trim failed.')
        await downloadResponse(response, `trimmed.${convertFormat}`)
      },
    })
  }

  const handleCompress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      compressOp.update('error', 'Select a media file first.')
      return
    }

    await compressOp.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', compressFormat)
        const response = await fetch(apiUrl('/api/media/compress'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Compress failed.')
        }
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('target_format', compressFormat)
        const response = await fetch(apiUrl('/api/media/compress'), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Compress failed.')
        await downloadResponse(response, `compressed.${compressFormat}`)
      },
    })
  }

  const handleCreateGif = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      gifOp.update('error', 'Select a media file first.')
      return
    }

    await gifOp.run({
      upload: async () => {
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
      },
      process: async () => {
        // Server handles processing
      },
      download: async () => {
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

        if (!response.ok) throw new Error('Request failed.')
        await downloadResponse(response, 'output.gif')
      },
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
          <form onSubmit={handleConvert} className="form">
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
              <button className="button primary" type="submit" disabled={convertOp.isBusy}>
                {convertOp.isBusy ? 'Converting...' : 'Convert & Download'}
              </button>
            </div>
            <StatusIndicator status={convertOp.state.status} error={convertOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Extract Audio</h2>
          <form onSubmit={handleExtractAudio} className="form">
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
              <button className="button primary" type="submit" disabled={extractOp.isBusy}>
                {extractOp.isBusy ? 'Extracting...' : 'Extract & Download'}
              </button>
            </div>
            <StatusIndicator status={extractOp.state.status} error={extractOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Trim Clip</h2>
          <form onSubmit={handleTrim} className="form">
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
              <button className="button primary" type="submit" disabled={trimOp.isBusy}>
                {trimOp.isBusy ? 'Trimming...' : 'Trim & Download'}
              </button>
            </div>
            <StatusIndicator status={trimOp.state.status} error={trimOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Compress Media</h2>
          <form onSubmit={handleCompress} className="form">
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
              <button className="button primary" type="submit" disabled={compressOp.isBusy}>
                {compressOp.isBusy ? 'Compressing...' : 'Compress & Download'}
              </button>
            </div>
            <StatusIndicator status={compressOp.state.status} error={compressOp.state.error} />
          </form>
        </div>

        <div className="tool-section">
          <h2>Create GIF from Video</h2>
          <form onSubmit={handleCreateGif} className="form">
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
              <button className="button primary" type="submit" disabled={gifOp.isBusy}>
                {gifOp.isBusy ? 'Creating GIF...' : 'Create GIF & Download'}
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
            <StatusIndicator status={gifOp.state.status} error={gifOp.state.error} />
          </form>
        </div>
      </div>
    </section>
  )
}

export default MediaToolkit
