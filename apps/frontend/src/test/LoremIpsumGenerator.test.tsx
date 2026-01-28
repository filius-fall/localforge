import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoremIpsumGenerator from '../pages/LoremIpsumGenerator'

describe('LoremIpsumGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default controls', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument()
    expect(screen.getByText('Generate placeholder text with configurable length.')).toBeInTheDocument()

    const paragraphsInput = screen.getByLabelText('Paragraphs') as HTMLInputElement
    expect(paragraphsInput).toBeInTheDocument()
    expect(paragraphsInput).toHaveValue(3)

    const sentencesInput = screen.getByLabelText('Sentences per Paragraph') as HTMLInputElement
    expect(sentencesInput).toBeInTheDocument()
    expect(sentencesInput).toHaveValue(4)

    const wordsInput = screen.getByLabelText('Words per Sentence') as HTMLInputElement
    expect(wordsInput).toBeInTheDocument()
    expect(wordsInput).toHaveValue(8)

    const totalWordsInput = screen.getByLabelText('Total Words (overrides others)') as HTMLInputElement
    expect(totalWordsInput).toBeInTheDocument()
    expect(totalWordsInput).toHaveValue('')
  })

  it('generates lorem ipsum text', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const output = screen.getByText('Click Generate to create text')
      expect(output.textContent).not.toBe('Click Generate to create text')
      expect(output.textContent).toBeTruthy()
    })
  })

  it('respects total words override', () => {
    render(<LoremIpsumGenerator />)

    const sentencesInput = screen.getByLabelText('Sentences per Paragraph') as HTMLInputElement
    const wordsInput = screen.getByLabelText('Words per Sentence') as HTMLInputElement
    const totalWordsInput = screen.getByLabelText('Total Words (overrides others)') as HTMLInputElement

    fireEvent.change(totalWordsInput, { target: { value: '100' } })
    expect(sentencesInput).toBeDisabled()
    expect(wordsInput).toBeDisabled()

    fireEvent.change(totalWordsInput, { target: { value: '' } })
    expect(sentencesInput).not.toBeDisabled()
    expect(wordsInput).not.toBeDisabled()
  })

  it('copies output to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const output = screen.getByText(/.+/)
      expect(output.textContent).toBeTruthy()
    })

    const copyButton = screen.getByText('Copy to Clipboard')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboard).toHaveBeenCalledWith(expect.stringMatching(/.+/))
    })

    vi.restoreAllMocks()
  })
})
