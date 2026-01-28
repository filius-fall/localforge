import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DataGenerator from '../pages/DataGenerator'

describe('DataGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial state', () => {
    render(<DataGenerator />)

    expect(screen.getByText('Data Generator')).toBeInTheDocument()
    expect(screen.getByText(/Generate fake profiles, addresses, and company data/)).toBeInTheDocument()
    expect(screen.getByLabelText('Number of Records')).toBeInTheDocument()
    expect(screen.getByText('Generate Data')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('generates data when Generate Data button is clicked', async () => {
    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/Profile \d+/)).toBeInTheDocument()
    })
  })

  it('displays generated profile data', async () => {
    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Profile 1')).toBeInTheDocument()
      expect(screen.getByText(/Name:/)).toBeInTheDocument()
      expect(screen.getByText(/Email:/)).toBeInTheDocument()
      expect(screen.getByText(/Phone:/)).toBeInTheDocument()
      expect(screen.getByText(/Address:/)).toBeInTheDocument()
      expect(screen.getByText(/City, State, Zip:/)).toBeInTheDocument()
      expect(screen.getByText(/Country:/)).toBeInTheDocument()
      expect(screen.getByText(/Company:/)).toBeInTheDocument()
      expect(screen.getByText(/Job Title:/)).toBeInTheDocument()
    })
  })

  it('copies single profile to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const copyButton = screen.getAllByTitle('Copy to clipboard')[0]
      fireEvent.click(copyButton)

      expect(mockClipboard).toHaveBeenCalled()
      const copiedText = mockClipboard.mock.calls[0][0] as string
      expect(copiedText).toContain('name:')
      expect(copiedText).toContain('email:')
    })
  })

  it('copies all profiles to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const copyAllButton = screen.getByText('Copy All to Clipboard')
      fireEvent.click(copyAllButton)

      expect(mockClipboard).toHaveBeenCalled()
      const copiedText = mockClipboard.mock.calls[0][0] as string
      expect(copiedText).toContain('--- Profile 1 ---')
    })
  })

  it('clears generated data when Clear button is clicked', async () => {
    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Profile 1')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.queryByText('Profile 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Copy All to Clipboard')).not.toBeInTheDocument()
    })
  })

  it('disables Clear button when no data', () => {
    render(<DataGenerator />)

    const clearButton = screen.getByText('Clear')
    expect(clearButton).toBeDisabled()
  })

  it('enables Clear button when data exists', async () => {
    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const clearButton = screen.getByText('Clear')
      expect(clearButton).not.toBeDisabled()
    })
  })

  it('respects count input constraints', () => {
    render(<DataGenerator />)

    const countInput = screen.getByLabelText('Number of Records') as HTMLInputElement

    // Test minimum constraint
    fireEvent.change(countInput, { target: { value: '0' } })
    expect(countInput.value).toBe('1')

    // Test maximum constraint
    fireEvent.change(countInput, { target: { value: '101' } })
    expect(countInput.value).toBe('100')
  })

  it('shows error when copy fails', async () => {
    const mockClipboard = vi.fn().mockRejectedValue(new Error('Copy failed'))
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<DataGenerator />)

    const generateButton = screen.getByText('Generate Data')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const copyAllButton = screen.getByText('Copy All to Clipboard')
      fireEvent.click(copyAllButton)

      waitFor(() => {
        const error = screen.getByText('Clipboard unavailable. Use HTTPS or localhost.')
        expect(error).toBeInTheDocument()
        expect(error).toHaveClass('form-error')
      })
    })
  })
})
