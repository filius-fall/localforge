import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColorPicker from '../pages/ColorPicker'

describe('ColorPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default hex color', () => {
    render(<ColorPicker />)

    expect(screen.getByText('Color Picker')).toBeInTheDocument()
    expect(screen.getByText('Pick colors and copy hex/rgb values.')).toBeInTheDocument()

    const hexInput = screen.getByLabelText('Hex Color') as HTMLInputElement
    expect(hexInput).toBeInTheDocument()
    expect(hexInput).toHaveValue('#00ff00')

    const rgbValue = screen.getByText(/rgb\(\s*\d+,\s*\d+,\s*\d+\)/)
    expect(rgbValue).toBeInTheDocument()
  })

  it('converts hex to rgb', async () => {
    render(<ColorPicker />)

    const hexInput = screen.getByLabelText('Hex Color') as HTMLInputElement
    const rgbRInput = screen.getByLabelText('R') as HTMLInputElement
    const rgbGInput = screen.getByLabelText('G') as HTMLInputElement
    const rgbBInput = screen.getByLabelText('B') as HTMLInputElement

    fireEvent.change(hexInput, { target: { value: '#ff0000' } })

    await waitFor(() => {
      expect(rgbRInput).toHaveValue(255)
      expect(rgbGInput).toHaveValue(0)
      expect(rgbBInput).toHaveValue(0)
    })

    const rgbOutput = screen.getByText(/rgb\(\s*255,\s*0,\s*0\)/)
    expect(rgbOutput).toBeInTheDocument()
    expect(rgbOutput.textContent).toBe('rgb(255, 0, 0)')
  })

  it('converts rgb to hex', async () => {
    render(<ColorPicker />)

    const rgbRInput = screen.getByLabelText('R') as HTMLInputElement
    const rgbGInput = screen.getByLabelText('G') as HTMLInputElement
    const rgbBInput = screen.getByLabelText('B') as HTMLInputElement

    fireEvent.change(rgbRInput, { target: { value: '100' } })
    fireEvent.change(rgbGInput, { target: { value: '150' } })
    fireEvent.change(rgbBInput, { target: { value: '50' } })

    await waitFor(() => {
      const hexOutput = screen.getByText(/#[0-9A-F]+/)

      expect(hexOutput).toBeInTheDocument()
      expect(hexOutput.textContent).toBe('#649632')
    })
  })

  it('copies hex to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<ColorPicker />)

    const hexInput = screen.getByLabelText('Hex Color') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: '#ff00ff' } })

    const copyButton = screen.getByText('Copy Hex')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboard).toHaveBeenCalledWith('#ff00ff')
    })
  })
})
