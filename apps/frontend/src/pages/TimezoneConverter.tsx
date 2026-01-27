import { useEffect, useMemo, useState } from 'react'
import { apiUrl, getJson } from '../lib/api'

type ConversionResult = {
  source_tz: string
  target_tz: string
  input_datetime: string
  output_datetime: string
  output_label: string
}

const fallbackZones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const formatLocalInput = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function TimezoneConverter() {
  const [zones, setZones] = useState<string[]>(fallbackZones)
  const [sourceZone, setSourceZone] = useState('UTC')
  const [targetZone, setTargetZone] = useState('America/New_York')
  const [dateTime, setDateTime] = useState(formatLocalInput(new Date()))
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const zoneOptions = useMemo(() => zones.sort(), [zones])

  useEffect(() => {
    getJson<string[]>('/api/timezone/zones')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setZones(data)
        }
      })
      .catch(() => undefined)
  }, [])

  const handleSwap = () => {
    setSourceZone(targetZone)
    setTargetZone(sourceZone)
  }

  const handleConvert = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(apiUrl('/api/timezone/convert'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_tz: sourceZone,
          target_tz: targetZone,
          datetime: dateTime,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.detail ?? 'Conversion failed.')
      }

      const data = (await response.json()) as ConversionResult
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Time Zone Converter</p>
        <h1>Convert time across regions with confidence.</h1>
        <p className="tool-subtitle">
          Select a source, target, and exact moment to sync your schedules.
        </p>
      </div>
      <div className="tool-panel">
        <form onSubmit={handleConvert} className="form">
          <div className="form-grid">
            <label className="field">
              <span>Source time zone</span>
              <select
                value={sourceZone}
                onChange={(event) => setSourceZone(event.target.value)}
                required
              >
                {zoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Target time zone</span>
              <select
                value={targetZone}
                onChange={(event) => setTargetZone(event.target.value)}
                required
              >
                {zoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Date & time</span>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(event) => setDateTime(event.target.value)}
                required
              />
            </label>
          </div>
          <div className="action-row">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Converting...' : 'Convert'}
            </button>
            <button
              className="button ghost"
              type="button"
              onClick={handleSwap}
            >
              Swap zones
            </button>
          </div>
        </form>
        {error && <p className="form-error">{error}</p>}
        {result && (
          <div className="result-card">
            <p className="result-label">Converted time</p>
            <p className="result-value">{result.output_label}</p>
            <p className="result-meta">{result.output_datetime}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default TimezoneConverter
