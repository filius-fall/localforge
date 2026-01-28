import { useState } from 'react'
import { apiUrl, getJson } from '../lib/api'

type MockRoute = {
  id: string
  method: string
  path: string
  status: number
  headers: Record<string, string>
  body: unknown
  delayMs: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

type MockRouteApi = {
  id: string
  method: string
  path: string
  status: number
  headers: Record<string, string>
  body: unknown
  delay_ms: number
  enabled: boolean
  created_at: string
  updated_at: string
}

type MockRouteResponse = {
  route: MockRouteApi
}

type MockRoutesResponse = {
  routes: MockRouteApi[]
}

type RouteForm = {
  method: string
  path: string
  status: number
  headers: string
  body: string
  delayMs: number
  enabled: boolean
}

const normalizeRoute = (route: MockRouteApi): MockRoute => ({
  id: route.id,
  method: route.method,
  path: route.path,
  status: route.status,
  headers: route.headers ?? {},
  body: route.body ?? null,
  delayMs: route.delay_ms ?? 0,
  enabled: route.enabled ?? true,
  createdAt: route.created_at ?? '',
  updatedAt: route.updated_at ?? '',
})

const defaultForm: RouteForm = {
  method: 'GET',
  path: '',
  status: 200,
  headers: '{"Content-Type": "application/json"}',
  body: '',
  delayMs: 0,
  enabled: true,
}

function MockApiServer() {
  const [routes, setRoutes] = useState<MockRoute[]>([])
  const [form, setForm] = useState<RouteForm>(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const loadRoutes = async () => {
    try {
      const data = await getJson<MockRoutesResponse>('/api/mock/routes')
      const normalized = (data.routes ?? []).map(normalizeRoute)
      setRoutes(normalized)
      setError('')
    } catch {
      setError('Failed to load mock routes')
    }
  }

  const validateForm = (nextForm: RouteForm): string | null => {
    if (!nextForm.path.startsWith('/') || nextForm.path.startsWith('/api') || nextForm.path.startsWith('/mock')) {
      return 'Path must start with / and cannot be /api or /mock'
    }
    if (nextForm.status < 200 || nextForm.status > 599) {
      return 'Status must be between 200 and 599'
    }
    if (nextForm.delayMs < 0 || nextForm.delayMs > 10000) {
      return 'Delay must be between 0 and 10000ms'
    }
    return null
  }

  const parseJsonField = (value: string, fallback: unknown, label: string) => {
    if (!value.trim()) {
      return fallback
    }
    try {
      return JSON.parse(value)
    } catch {
      throw new Error(`${label} must be valid JSON`)
    }
  }

  const buildPayload = (nextForm: RouteForm) => {
    const headers = parseJsonField(nextForm.headers, {}, 'Headers') as Record<string, string>
    const body = parseJsonField(nextForm.body, null, 'Body')
    return {
      method: nextForm.method,
      path: nextForm.path,
      status: nextForm.status,
      headers,
      body,
      delay_ms: nextForm.delayMs,
      enabled: nextForm.enabled,
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    setError('')

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    let payload
    try {
      payload = buildPayload(form)
    } catch (err) {
      setError((err as Error).message)
      return
    }

    try {
      if (editingId) {
        const response = await fetch(apiUrl(`/api/mock/routes/${editingId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        })
        if (!response.ok) {
          setError(`Failed to update route: ${response.status}`)
          return
        }
        const data = (await response.json()) as MockRouteResponse
        const updated = normalizeRoute(data.route)
        setRoutes((prev) => prev.map((route) => (route.id === updated.id ? updated : route)))
      } else {
        const response = await fetch(apiUrl('/api/mock/routes'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          setError(`Failed to create route: ${response.status}`)
          return
        }
        const data = (await response.json()) as MockRouteResponse
        const created = normalizeRoute(data.route)
        setRoutes((prev) => [created, ...prev])
      }

      resetForm()
      setError('')
    } catch {
      setError('Failed to save route')
    }
  }

  const handleDelete = async (routeId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/mock/routes/${routeId}`), {
        method: 'DELETE',
      })
      if (!response.ok) {
        setError(`Failed to delete route: ${response.status}`)
        return
      }
      setRoutes((prev) => prev.filter((route) => route.id !== routeId))
      if (editingId === routeId) {
        resetForm()
      }
    } catch {
      setError('Failed to delete route')
    }
  }

  const handleEdit = (route: MockRoute) => {
    setEditingId(route.id)
    setForm({
      method: route.method,
      path: route.path,
      status: route.status,
      headers: JSON.stringify(route.headers ?? {}, null, 2),
      body: route.body ? JSON.stringify(route.body, null, 2) : '',
      delayMs: route.delayMs,
      enabled: route.enabled,
    })
    setError('')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Mock API Server</h1>
        <p className="tool-subtitle">
          Create, update, and delete mock endpoints with custom responses.
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>{editingId ? 'Update Route' : 'Create Route'}</h2>

          <div className="form-group">
            <label htmlFor="method">Method</label>
            <select
              id="method"
              value={form.method}
              onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
              className="input"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="path">Path</label>
            <input
              id="path"
              type="text"
              value={form.path}
              onChange={(e) => setForm((prev) => ({ ...prev, path: e.target.value }))}
              placeholder="/example"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <input
              id="status"
              type="number"
              min="200"
              max="599"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: Number(e.target.value) }))}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delay">Delay (ms)</label>
            <input
              id="delay"
              type="number"
              min="0"
              max="10000"
              value={form.delayMs}
              onChange={(e) => setForm((prev) => ({ ...prev, delayMs: Number(e.target.value) }))}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="headers">Headers (JSON)</label>
            <textarea
              id="headers"
              value={form.headers}
              rows={3}
              onChange={(e) => setForm((prev) => ({ ...prev, headers: e.target.value }))}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Body (JSON)</label>
            <textarea
              id="body"
              value={form.body}
              rows={4}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              className="input"
            />
          </div>

          <div className="checkbox-row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
              />
              Enabled
            </label>
          </div>

          <div className="button-row">
            <button className="button primary" type="button" onClick={handleSubmit}>
              {editingId ? 'Update Route' : 'Create Route'}
            </button>
            {editingId && (
              <button className="button secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="tool-section">
          <h2>Routes</h2>
          <button className="button ghost" type="button" onClick={loadRoutes}>
            Refresh Routes
          </button>

          {routes.length === 0 ? (
            <p className="empty-state">No routes created yet.</p>
          ) : (
            <div className="routes-list">
              {routes.map((route) => (
                <div key={route.id} className="route-card">
                  <div className="route-header">
                    <span className={`route-method ${route.method.toLowerCase()}`}>
                      {route.method}
                    </span>
                    <span className="route-path">{route.path}</span>
                  </div>
                  <div className="route-meta">
                    <span>Status: {route.status}</span>
                    <span>Delay: {route.delayMs}ms</span>
                    <span>{route.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="route-actions">
                    <button className="button secondary" type="button" onClick={() => handleEdit(route)}>
                      Edit
                    </button>
                    <button className="button ghost" type="button" onClick={() => handleDelete(route.id)}>
                      Delete
                    </button>
                  </div>
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

export default MockApiServer
