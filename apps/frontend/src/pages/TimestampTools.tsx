import { useEffect, useMemo, useState } from 'react'
import cronParser from 'cron-parser'
import { getJson } from '../lib/api'

const formatDate = (date: Date) => date.toLocaleString()

function TimestampTools() {
  const [epochInput, setEpochInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [cronInput, setCronInput] = useState('*/15 * * * *')
  const [zones, setZones] = useState<string[]>([])
  const [selectedZones, setSelectedZones] = useState<string[]>(['UTC', 'America/New_York'])
  const [zoneInput, setZoneInput] = useState('')

  useEffect(() => {
    getJson<string[]>('/api/timezone/zones')
      .then((data) => setZones(data))
      .catch(() => undefined)
  }, [])

  const epochResult = useMemo(() => {
    if (!epochInput.trim()) {
      return null
    }
    const value = Number(epochInput)
    if (Number.isNaN(value)) {
      return null
    }
    const date = value > 9999999999 ? new Date(value) : new Date(value * 1000)
    return {
      local: formatDate(date),
      utc: date.toUTCString(),
    }
  }, [epochInput])

  const dateResult = useMemo(() => {
    if (!dateInput) {
      return null
    }
    const date = new Date(dateInput)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    }
  }, [dateInput])

  const cronResult = useMemo(() => {
    try {
      const interval = cronParser.parseExpression(cronInput, { utc: true })
      const nextRuns = []
      for (let i = 0; i < 5; i += 1) {
        nextRuns.push(interval.next().toISOString())
      }
      return nextRuns
    } catch {
      return []
    }
  }, [cronInput])

  const zoneTimes = useMemo(() => {
    const now = new Date()
    return selectedZones.map((zone) => ({
      zone,
      time: new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now),
    }))
  }, [selectedZones])

  const addZone = () => {
    const value = zoneInput.trim()
    if (!value || selectedZones.includes(value)) {
      return
    }
    setSelectedZones((prev) => [...prev, value])
    setZoneInput('')
  }

  const removeZone = (zone: string) => {
    setSelectedZones((prev) => prev.filter((item) => item !== zone))
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Timestamp Tools</p>
        <h1>Convert epochs, cron schedules, and zones.</h1>
        <p className="tool-subtitle">
          Work in UTC or local time with quick conversions.
        </p>
      </div>
      <div className="tool-panel">
        <div className="tool-section">
          <h2>Epoch → Human</h2>
          <label className="field">
            <span>Epoch (seconds or milliseconds)</span>
            <input value={epochInput} onChange={(event) => setEpochInput(event.target.value)} />
          </label>
          {epochResult && (
            <div className="output-grid">
              <div className="output-card">
                <p className="preview-label">Local</p>
                <pre>{epochResult.local}</pre>
              </div>
              <div className="output-card">
                <p className="preview-label">UTC</p>
                <pre>{epochResult.utc}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="tool-section">
          <h2>Human → Epoch</h2>
          <label className="field">
            <span>Date & time</span>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </label>
          {dateResult && (
            <div className="output-grid">
              <div className="output-card">
                <p className="preview-label">Seconds</p>
                <pre>{dateResult.seconds}</pre>
              </div>
              <div className="output-card">
                <p className="preview-label">Milliseconds</p>
                <pre>{dateResult.milliseconds}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="tool-section">
          <h2>Cron Helper (UTC)</h2>
          <label className="field">
            <span>Cron expression</span>
            <input value={cronInput} onChange={(event) => setCronInput(event.target.value)} />
          </label>
          <div className="output-card">
            <p className="preview-label">Next 5 runs</p>
            <pre>{cronResult.length ? cronResult.join('\n') : 'Invalid cron'}</pre>
          </div>
        </div>

        <div className="tool-section">
          <h2>Timezone Compare</h2>
          <div className="form-grid">
            <label className="field">
              <span>Add timezone</span>
              <input
                list="tz-list"
                value={zoneInput}
                onChange={(event) => setZoneInput(event.target.value)}
              />
            </label>
          </div>
          <datalist id="tz-list">
            {zones.map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>
          <div className="action-row">
            <button className="button primary" type="button" onClick={addZone}>
              Add Zone
            </button>
          </div>
          <div className="info-grid">
            {zoneTimes.map((item) => (
              <div key={item.zone} className="info-card">
                <p className="info-label">{item.zone}</p>
                <p className="info-value">{item.time}</p>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => removeZone(item.zone)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TimestampTools
