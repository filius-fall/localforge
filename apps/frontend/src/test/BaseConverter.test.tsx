import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BaseConverter from '../pages/BaseConverter'

describe('BaseConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial state', () => {
    render(<BaseConverter />)

    expect(screen.getByText('Base Converter')).toBeInTheDocument()
    expect(screen.getByText(/Convert numbers between different bases/)).toBeInTheDocument()
    expect(screen.getByLabelText('Input Base')).toBeInTheDocument()
    expect(screen.getByLabelText('Input Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Output Base')).toBeInTheDocument()
    expect(screen.getByText('Convert')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('converts decimal to hexadecimal', () => {
    render(<BaseConverter />)

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '255' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('FF')).toBeInTheDocument()
  })

  it('converts hexadecimal to decimal', () => {
    render(<BaseConverter />)

    const inputBase = screen.getByLabelText('Input Base')
    fireEvent.change(inputBase, { target: { value: '16' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: 'FF' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('255')).toBeInTheDocument()
  })

  it('converts binary to decimal', () => {
    render(<BaseConverter />)

    const inputBase = screen.getByLabelText('Input Base')
    fireEvent.change(inputBase, { target: { value: '2' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '1010' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('converts decimal to binary', () => {
    render(<BaseConverter />)

    const outputBase = screen.getByLabelText('Output Base')
    fireEvent.change(outputBase, { target: { value: '2' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '10' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('1010')).toBeInTheDocument()
  })

  it('converts decimal to octal', () => {
    render(<BaseConverter />)

    const outputBase = screen.getByLabelText('Output Base')
    fireEvent.change(outputBase, { target: { value: '8' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '64' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('shows error for invalid input in decimal', () => {
    render(<BaseConverter />)

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: 'ABC' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid number for base 10')).toBeInTheDocument()
  })

  it('shows error for invalid input in hexadecimal', () => {
    render(<BaseConverter />)

    const inputBase = screen.getByLabelText('Input Base')
    fireEvent.change(inputBase, { target: { value: '16' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: 'GH' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid number for base 16')).toBeInTheDocument()
  })

  it('shows error for invalid input in binary', () => {
    render(<BaseConverter />)

    const inputBase = screen.getByLabelText('Input Base')
    fireEvent.change(inputBase, { target: { value: '2' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '102' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('Invalid number for base 2')).toBeInTheDocument()
  })

  it('clears result when cleared', () => {
    render(<BaseConverter />)

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '255' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('FF')).toBeInTheDocument()

    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)

    expect(inputNumber.value).toBe('')
    expect(screen.queryByText('FF')).not.toBeInTheDocument()
  })

  it('swaps bases when swap button is clicked', () => {
    render(<BaseConverter />)

    const inputBase = screen.getByLabelText('Input Base') as HTMLSelectElement
    const outputBase = screen.getByLabelText('Output Base') as HTMLSelectElement

    expect(inputBase.value).toBe('10')
    expect(outputBase.value).toBe('16')

    const swapButton = screen.getByText('Swap Bases')
    fireEvent.click(swapButton)

    expect(inputBase.value).toBe('16')
    expect(outputBase.value).toBe('10')
  })

  it('disables convert button when input is empty', () => {
    render(<BaseConverter />)

    const convertButton = screen.getByText('Convert')
    expect(convertButton).toBeDisabled()
  })

  it('disables clear button when no output', () => {
    render(<BaseConverter />)

    const clearButton = screen.getByText('Clear')
    expect(clearButton).toBeDisabled()
  })

  it('copies result to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<BaseConverter />)

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '255' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    const copyButton = screen.getByTitle('Copy to clipboard')
    fireEvent.click(copyButton)

    expect(mockClipboard).toHaveBeenCalledWith('FF')

    vi.restoreAllMocks()
  })

  it('shows result base information', () => {
    render(<BaseConverter />)

    const outputBase = screen.getByLabelText('Output Base')
    fireEvent.change(outputBase, { target: { value: '16' } })

    const inputNumber = screen.getByLabelText('Input Number') as HTMLInputElement
    fireEvent.change(inputNumber, { target: { value: '255' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    expect(screen.getByText('Base 16')).toBeInTheDocument()
  })
})
