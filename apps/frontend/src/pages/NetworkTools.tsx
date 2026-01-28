import { useState } from 'react'
import { apiUrl } from '../lib/api'

function NetworkTools() {
  const [host, setHost] = useState('')
  const [dnsType, setDnsType] = useState('A')
  const [port, setPort] = useState('443')
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [dnsResult, setDnsResult] = useState<string[] | null>(null)
  const [portResult, setPortResult] = useState<string | null>(null)
  const [ipInfo, setIpInfo] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const runAction = async (action: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  const handlePing = async () => {
    if (!host.trim()) {
      setError('Enter a host to ping.')
      return
    }
    await runAction(async () => {
      const response = await fetch(apiUrl(`/api/network/ping?host=${encodeURIComponent(host)}`))
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Ping failed.')
      }
      const data = (await response.json()) as { output: string }
      setPingResult(data.output)
    })
  }

  const handleDns = async () => {
    if (!host.trim()) {
      setError('Enter a host for DNS lookup.')
      return
    }
    await runAction(async () => {
      const response = await fetch(
        apiUrl(`/api/network/dns?host=${encodeURIComponent(host)}&record_type=${dnsType}`)
      )
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'DNS lookup failed.')
      }
      const data = (await response.json()) as { answers: string[] }
      setDnsResult(data.answers)
    })
  }

  const handlePort = async () => {
    if (!host.trim()) {
      setError('Enter a host for port check.')
      return
    }
    await runAction(async () => {
      const response = await fetch(
        apiUrl(`/api/network/port?host=${encodeURIComponent(host)}&port=${port}`)
      )
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Port check failed.')
      }
      const data = (await response.json()) as { open: boolean }
      setPortResult(data.open ? 'Open' : 'Closed')
    })
  }

  const handleIpInfo = async () => {
    await runAction(async () => {
      const response = await fetch(apiUrl('/api/network/ip'))
      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.detail ?? 'Request failed.')
      }
      const data = (await response.json()) as Record<string, string>
      setIpInfo(data)
    })
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Network Helpers</p>
        <h1>Quick diagnostics for local network checks.</h1>
        <p className="tool-subtitle">
          Ping hosts, inspect DNS, check ports, and view IP info.
        </p>
      </div>
      <div className="tool-panel">
        <div className="tool-section">
          <h2>Host</h2>
          <div className="form-grid">
            <label className="field">
              <span>Hostname or IP</span>
              <input value={host} onChange={(event) => setHost(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="tool-section">
          <h2>Ping</h2>
          <div className="action-row">
            <button className="button primary" type="button" disabled={loading} onClick={handlePing}>
              Run Ping
            </button>
          </div>
          {pingResult && <pre className="output-box">{pingResult}</pre>}
        </div>

        <div className="tool-section">
          <h2>DNS Lookup</h2>
          <div className="form-grid">
            <label className="field">
              <span>Record type</span>
              <select value={dnsType} onChange={(event) => setDnsType(event.target.value)}>
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
                <option value="TXT">TXT</option>
                <option value="NS">NS</option>
              </select>
            </label>
          </div>
          <div className="action-row">
            <button className="button primary" type="button" disabled={loading} onClick={handleDns}>
              Lookup DNS
            </button>
          </div>
          {dnsResult && (
            <ul className="result-list">
              {dnsResult.map((answer) => (
                <li key={answer}>{answer}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="tool-section">
          <h2>Port Check</h2>
          <div className="form-grid">
            <label className="field">
              <span>Port</span>
              <input value={port} onChange={(event) => setPort(event.target.value)} />
            </label>
          </div>
          <div className="action-row">
            <button className="button primary" type="button" disabled={loading} onClick={handlePort}>
              Check Port
            </button>
          </div>
          {portResult && <p className="form-status">Port is {portResult}</p>}
        </div>

        <div className="tool-section">
          <h2>IP Info</h2>
          <div className="action-row">
            <button className="button primary" type="button" disabled={loading} onClick={handleIpInfo}>
              Fetch IP Info
            </button>
          </div>
          {ipInfo && (
            <div className="info-grid">
              {Object.entries(ipInfo).map(([key, value]) => (
                <div key={key} className="info-card">
                  <p className="info-label">{key}</p>
                  <p className="info-value">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default NetworkTools
