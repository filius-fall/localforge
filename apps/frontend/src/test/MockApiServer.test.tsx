import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MockApiServer from '../pages/MockApiServer'

const createMockResponse = (data: unknown, ok = true) =>
  Promise.resolve({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
  } as Response)

describe('MockApiServer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the create form and routes section', () => {
    render(<MockApiServer />)

    expect(screen.getByText('Mock API Server')).toBeInTheDocument()
    expect(screen.getByText('Create Route')).toBeInTheDocument()
    expect(screen.getByLabelText('Method')).toBeInTheDocument()
    expect(screen.getByLabelText('Path')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Delay (ms)')).toBeInTheDocument()
    expect(screen.getByLabelText('Headers (JSON)')).toBeInTheDocument()
    expect(screen.getByLabelText('Body (JSON)')).toBeInTheDocument()
    expect(screen.getByText('Routes')).toBeInTheDocument()
  })

  it('creates a new route and shows it in the list', async () => {
    const mockRoute = {
      id: 'route-1',
      method: 'GET',
      path: '/test',
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true },
      delay_ms: 0,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(global, 'fetch').mockImplementation(() => createMockResponse({ route: mockRoute }))

    render(<MockApiServer />)

    fireEvent.change(screen.getByLabelText('Path'), { target: { value: '/test' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText('Headers (JSON)'), {
      target: { value: '{"Content-Type": "application/json"}' },
    })
    fireEvent.change(screen.getByLabelText('Body (JSON)'), {
      target: { value: '{"ok": true}' },
    })

    fireEvent.click(screen.getByText('Create Route'))

    await waitFor(() => {
      expect(screen.getByText('/test')).toBeInTheDocument()
      expect(screen.getByText('GET')).toBeInTheDocument()
      expect(screen.getByText('Status: 200')).toBeInTheDocument()
    })
  })

  it('updates a route when editing', async () => {
    const initialRoute = {
      id: 'route-1',
      method: 'GET',
      path: '/edit',
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true },
      delay_ms: 0,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedRoute = {
      ...initialRoute,
      status: 201,
      updated_at: new Date().toISOString(),
    }

    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => createMockResponse({ route: initialRoute }))
      .mockImplementationOnce(() => createMockResponse({ route: updatedRoute }))

    render(<MockApiServer />)

    fireEvent.change(screen.getByLabelText('Path'), { target: { value: '/edit' } })
    fireEvent.click(screen.getByText('Create Route'))

    await waitFor(() => {
      expect(screen.getByText('/edit')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Edit'))
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: '201' } })
    fireEvent.click(screen.getByText('Update Route'))

    await waitFor(() => {
      expect(screen.getByText('Status: 201')).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalled()
  })

  it('deletes a route', async () => {
    const mockRoute = {
      id: 'route-1',
      method: 'GET',
      path: '/delete',
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true },
      delay_ms: 0,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => createMockResponse({ route: mockRoute }))
      .mockImplementationOnce(() => createMockResponse({ deleted: true }))

    render(<MockApiServer />)

    fireEvent.change(screen.getByLabelText('Path'), { target: { value: '/delete' } })
    fireEvent.click(screen.getByText('Create Route'))

    await waitFor(() => {
      expect(screen.getByText('/delete')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.queryByText('/delete')).not.toBeInTheDocument()
    })
  })
})
