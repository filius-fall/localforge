import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorConverter from '../ColorConverter'

describe('ColorConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial state', () => {
    render(<ColorConverter />)

    expect(screen.getByText('Color Converter')).toBeInTheDocument()
    expect(screen.getByText(/Convert colors between HEX and RGB formats/)).toBeInTheDocument()
    expect(screen.getByText('HEX to RGB')).toBeInTheDocument()
    expect(screen.getByText('RGB to HEX')).toBeInTheDocument()
  })

  it('converts hex to rgb for 6-digit hex', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: 'FF0000' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
  })

  it('converts hex to rgb for 3-digit hex', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: 'F00' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
  })

  it('converts hex to rgb for green', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: '00FF00' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('rgb(0, 255, 0)')).toBeInTheDocument()
  })

  it('converts hex to rgb for blue', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: '0000FF' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('rgb(0, 0, 255)')).toBeInTheDocument()
  })

  it('converts rgb to hex', () => {
    render(<ColorConverter />)

    const rgbInput = screen.getByPlaceholderText('rgb(r, g, b) or rgba(r, g, b, a)') as HTMLInputElement
    fireEvent.change(rgbInput, { target: { value: 'rgb(255, 0, 0)' } })

    const convertButton = screen.getAllByText('Convert')[1]
    fireEvent.click(convertButton)

    expect(screen.getByText('#FF0000')).toBeInTheDocument()
  })

  it('converts rgba to hex', () => {
    render(<ColorConverter />)

    const rgbInput = screen.getByPlaceholderText('rgb(r, g, b) or rgba(r, g, b, a)') as HTMLInputElement
    fireEvent.change(rgbInput, { target: { value: 'rgba(255, 0, 0, 0.5)' } })

    const convertButton = screen.getAllByText('Convert')[1]
    fireEvent.click(convertButton)

    expect(screen.getByText('#FF0000')).toBeInTheDocument()
  })

  it('shows error for invalid hex', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: 'GGGGGG' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid hex color. Use #RRGGBB or #RGB format.')).toBeInTheDocument()
  })

  it('shows error for invalid rgb', () => {
    render(<ColorConverter />)

    const rgbInput = screen.getByPlaceholderText('rgb(r, g, b) or rgba(r, g, b, a)') as HTMLInputElement
    fireEvent.change(rgbInput, { target: { value: 'invalid' } })

    const convertButton = screen.getAllByText('Convert')[1]
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid RGB color. Use rgb(r, g, b) or rgba(r, g, b, a) format.')).toBeInTheDocument()
  })

  it('shows error for rgb values out of range', () => {
    render(<ColorConverter />)

    const rgbInput = screen.getByPlaceholderText('rgb(r, g, b) or rgba(r, g, b, a)') as HTMLInputElement
    fireEvent.change(rgbInput, { target: { value: 'rgb(256, 0, 0)' } })

    const convertButton = screen.getAllByText('Convert')[1]
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid RGB color. Use rgb(r, g, b) or rgba(r, g, b, a) format.')).toBeInTheDocument()
  })

  it('clears all when Clear button is clicked', () => {
    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: 'FF0000' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()

    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)

    expect(hexInput.value).toBe('')
    expect(screen.queryByText('rgb(255, 0, 0)')).not.toBeInTheDocument()
  })

  it('copies rgb to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<ColorConverter />)

    const hexInput = screen.getByPlaceholderText('RRGGBB or RGB') as HTMLInputElement
    fireEvent.change(hexInput, { target: { value: 'FF0000' } })

    const convertButton = screen.getAllByText('Convert')[0]
    fireEvent.click(convertButton)

    const copyButton = screen.getAllByTitle('Copy to clipboard')[0]
    fireEvent.click(copyButton)

    expect(mockClipboard).toHaveBeenCalledWith('rgb(255, 0, 0)')

    vi.restoreAllMocks()
  })

  it('copies hex to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<ColorConverter />)

    const rgbInput = screen.getByPlaceholderText('rgb(r, g, b) or rgba(r, g, b, a)') as HTMLInputElement
    fireEvent.change(rgbInput, { target: { value: 'rgb(255, 0, 0)' } })

    const convertButton = screen.getAllByText('Convert')[1]
    fireEvent.click(convertButton)

    const copyButton = screen.getAllByTitle('Copy to clipboard')[1]
    fireEvent.click(copyButton)

    expect(mockClipboard).toHaveBeenCalledWith('#FF0000')

    vi.restoreAllMocks()
  })

  it('disables convert button when input is empty', () => {
    render(<ColorConverter />)

    const convertButtons = screen.getAllByText('Convert')
    expect(convertButtons[0]).toBeDisabled()
    expect(convertButtons[1]).toBeDisabled()
  })

  it('hides Clear All button when no output', () => {
    render(<ColorConverter />)
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
  })
})
