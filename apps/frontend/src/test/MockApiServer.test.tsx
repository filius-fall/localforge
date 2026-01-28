import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MockApiServer from '../MockApiServer'

describe('MockApiServer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with no routes', () => {
    render(<MockApiServer />)

    expect(screen.getByText('Create Route')).toBeInTheDocument()
    expect(screen.getByText('Update and Delete Route')).toBeInTheDocument()
    expect(screen.getByText('Create Route')).toBeInTheDocument()
    expect(screen.getByText('GET Routes')).toBeInTheDocument()
  })

  it('creates a new route', async () => {
    render(<MockApiServer />)

    const routeInput = screen.getByLabelText('Path') as HTMLInputElement
    const methodInput = screen.getByLabelText('Method') as HTMLSelectElement
    const statusInput = screen.getByLabelText('Status') as HTMLInputElement
    const enabledInput = screen.getByLabelText('Enabled') as HTMLInputElement
    const bodyInput = screen.getByLabelText('Body') as HTMLTextAreaElement

    fireEvent.click(screen.getByText('Create Route'))

    await waitFor(() => {
      expect(screen.getByText('GET Routes').not.toHaveBeenCalled()
      expect(screen.getByText('GET Routes')).not.toHaveBeenCalled()
      expect(screen.getByText('Update and Delete Route')).not.toHaveBeenCalled()
    })

    const newRoute = screen.queryAllByRole('route-card').find(el =>
      el?.textContent?.includes('GET')
    )
  }) ?? null

    // Find create/update/delete buttons
    const createButton = screen.getAllByRole('button').find(btn => 
      btn?.className === 'button' && btn.textContent?.includes('Create')
    )
    const updateButton = screen.getAllByRole('button').find(btn =>
      btn?.className === 'button' && btn.textContent?.includes('Update')
    )
    const deleteButton = screen.getAllByRole('button').find(btn =>
      btn?.className === 'button' && btn.textContent?.includes('Delete')
    )

    if (newRoute) {
      fireEvent.click(newRoute)
    } else if (updateRoute) {
      fireEvent.click(updateButton)
    }

    await waitFor(() => {
      expect(screen.queryByRole('route-card')).toHaveLength(2)
    })
  })
})
