# Mock API Server Frontend Page

import { useState } from 'react'
import { getJson } from '../../lib/api'

interface MockRoute {
  method: string
  path: string
  status: number
  headers: Record<string, string>
  body: any
  delayMs: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

function MockApiServer() {
  const [routes, setRoutes] = useState<MockRoute[]>([])
  const [newRoute, setNewRoute] = useState<Partial<MockRoute>>({
    method: 'GET',
    path: '',
    status: 200,
    headers: {},
    body: null,
    delayMs: 0,
    enabled: true,
    createdAt: '',
    updatedAt: '',
  })
  const [error, setError] = useState<string>('')

  const loadRoutes = () => {
    getJson<MockRoute[]>('/api/mock/routes')
      .then((data) => {
        setRoutes(data.routes || [])
        setError('')
      })
      .catch(() => {
        setError('Failed to load mock routes')
      })
  }

  const validateRoute = (route: Partial<MockRoute>) => {
    if (!route.path.startsWith('/') || route.path.startsWith('/api') || route.path.startsWith('/mock')) {
      return { isValid: false, error: 'Path must start with / and cannot be /api or /mock' }
    }
    
    const isValid = route.status === 200 && route.status <= 599
      && (!route.delayMs || route.delayMs === 0)
      && (!route.body || route.headers.get('Content-Type', '').toLowerCase() === 'application/json' || route.body === null || len(JSON.stringify(route.body || '')) <= 524288)
    
    return { isValid: true }
  }

  const handleCreate = () => {
    const route = {
      method: newRoute.method,
      path: newRoute.path,
      status: newRoute.status,
      headers: newRoute.headers,
      body: newRoute.body,
      delayMs: newRoute.delayMs,
      enabled: newRoute.enabled,
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!validateRoute(route)) {
      setError(route.error || 'Invalid route configuration')
      return
    }

    try {
      const response = await getJson<Response>('/api/mock/routes', {
        method: 'POST',
        body: JSON.stringify(route),
      })

      if (!response.ok) {
        setError('Failed to create route')
        return
      }

      const data = await response.json()
      setRoutes([...routes, { ...data, 'id': response.id, ...route }])
      setNewRoute({
        method: 'GET',
        path: '',
        status: 200,
        headers: {},
        body: null,
        delayMs: 0,
        enabled: true,
        createdAt: '',
        updatedAt: '',
      })
      setError('')

      logger.info('mock.route.created id=%s', response.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<MockRoute>) => {
    const route = routes.find((r) => r.id === id)
    
    if (!route) {
      setError('Route not found')
      return
    }

    if (!validateRoute(updates)) {
      setError(updates.error || 'Invalid route configuration')
      return
    }

    const updatedRoute = {
      ...route,
      id: route.id,
      status: updates.status || route.status,
      headers: updates.headers || route.headers,
      body: updates.body || route.body,
      delayMs: updates.delayMs || route.delayMs,
      enabled: updates.enabled !== undefined ? updates.enabled : route.enabled,
      updatedAt: new Date().toISOString(),
    }

    try {
      const response = await getJson<Response>(`/api/mock/routes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        setError(`Failed to update route: ${response.status}`)
        return
      }

      const data = await response.json()
      const updatedRoute = routes.find((r) => r.id === id)
      
      if (!updatedRoute) {
        setError('Route not found')
        return
      }

      routes[route_index] = updatedRoute
      setNewRoute({
        ...updatedRoute,
        updatedAt: new Date().toISOString(),
      })

      setError('')
      logger.info('mock.route.updated id=%s', id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    const route = routes.find((r) => r.id === id)
    
    if (!route) {
      setError('Route not found')
      return
    }

    try {
      const response = await getJson<Response>(`/api/mock/routes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        setError(`Failed to delete route: ${response.status}`)
        return
      }

      setRoutes(routes.filter(r => r.id !== id))
      
      setError('')
      logger.info('mock.route.deleted id=%s', id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Mock API Server</h1>
        <p className="tool-subtitle">
          Create, update, and delete mock endpoints with custom responses
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>Create Route</h2>

          <label className="field">
            <span>Method</span>
            <select value={newRoute.method} onChange={(e) => setNewRoute({ ...newRoute, method: e.target.value as any }) >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
              <option value="HEAD">HEAD</option>
            </select>

          <label className="field">
            <span>Path</span>
            <input
              type="text"
              value={newRoute.path}
              placeholder="/example/path"
              onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value as string })}
              disabled={!!newRoute.method}
            />
          </label>

          <div className="checkbox-wrapper">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={newRoute.enabled !== undefined ? newRoute.enabled : false}
                onChange={(e) => setNewRoute({ ...newRoute, enabled: e.target.checked })}
              />
            </label>

          <button
            className="button primary"
            type="button"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>

        <div className="tool-section">
          <h2>Response Body & Headers</h2>

          <label className="field">
            <span>Response Body (JSON)</span>
            <textarea
              value={JSON.stringify(newRoute.body || '')}
              rows={3}
              onChange={(e) => setNewRoute({ ...newRoute, body: JSON.parse(e.target.value as string) || null })}
            />
          </label>

          <label className="field">
            <span>Headers (key=value pairs)</span>
            <input
              type="text"
              value={JSON.stringify(newRoute.headers || {})}
              onChange={(e) => setNewRoute({ ...newRoute, headers: JSON.parse(e.target.value as string) || {} })}
              rows={3}
            />
          </label>

          <div className="checkbox-wrapper">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={newRoute.enabled !== undefined ? newRoute.enabled : false}
                onChange={(e) => setNewRoute({ ...newRoute, enabled: e.target.checked })}
              />
            </label>

          <button
            className="button primary"
            type="button"
            onClick={handleCreate}
          >
            Create Route
          </button>
        </div>

        <div className="tool-section">
          <h2>Current Routes</h2>

          <button
            className="button ghost"
            type="button"
            onClick={loadRoutes}
          >
            Refresh Routes
          </button>

          <div className="routes-list">
            {routes.map((route, index) => (
              <div key={route.id} className="route-card">
                <div className="route-header">
                  <span className={`route-method ${route.method.toLowerCase()}`}>{route.method}</span>
                  <span className="route-path">{route.path || '(root)'}</span>
                <span className="route-status">{route.status}</span>
                <span className="route-enabled">{route.enabled ? 'enabled' : 'disabled'}</span>
                </div>

                <div className="route-meta">
                  <button
                    className="route-delete"
                    type="button"
                    onClick={() => handleDelete(route.id)}
                    disabled={!route.id}
                  >
                    ×
                  </button>
                  <span className="route-path">{route.path}</span>
                  <span className="route-date">{new Date(route.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {route.body && (
                <div className="route-body">
                  <label className="field">Body</label>
                  <pre className="route-body-content">{JSON.stringify(route.body)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  </section>
  )
}

export default MockApiServer
