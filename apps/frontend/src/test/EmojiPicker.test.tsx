import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EmojiPicker from '../EmojiPicker'

describe('EmojiPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with emoji picker', () => {
    render(<EmojiPicker />)

    expect(screen.getByText('Emoji Picker')).toBeInTheDocument()
    expect(screen.getByText('Search, select, and copy emojis')).toBeInTheDocument()
  })

  it('adds emoji when clicked', () => {
    render(<EmojiPicker />)

    const picker = screen.getByText('emoji-picker-react') as HTMLElement
    const firstEmoji = picker.querySelector('button[title="grinning face"]')

    if (firstEmoji) {
      fireEvent.click(firstEmoji)

      await waitFor(() => {
        expect(screen.getByText('Selected Emojis')).toBeInTheDocument()
      })

      const selectedEmoji = screen.getByText('😀')
      expect(selectedEmoji).toBeInTheDocument()
    }
  })

  it('removes emoji when remove button clicked', () => {
    render(<EmojiPicker />)
    const picker = screen.getByText('emoji-picker-react') as HTMLElement

    fireEvent.click(screen.getByTitle('grinning face'))

    await waitFor(() => {
      const selectedEmoji = screen.getByText('😀')
      expect(selectedEmoji).toBeInTheDocument()

      const removeButton = screen.getAllByRole('button').find(btn =>
        btn.className === 'emoji-remove'
      ) as HTMLButtonElement | undefined

      if (removeButton) {
        fireEvent.click(removeButton)

        await waitFor(() => {
          expect(selectedEmoji).not.toBeInTheDocument()
        })
      }
    })
  })

  it('copies emojis to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<EmojiPicker />)

    // Add an emoji
    const picker = screen.getByText('emoji-picker-react') as HTMLElement
    const firstEmoji = picker.querySelector('button[title="grinning face"]')
    fireEvent.click(firstEmoji)

    await waitFor(() => {
      const copyButton = screen.getByText('Copy All to Clipboard')
      expect(copyButton).toBeInTheDocument()

      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockClipboard).toHaveBeenCalledWith('😀')
      })
    })

    vi.restoreAllMocks()
  })

  it('shows error when copy fails', async () => {
    const mockClipboard = vi.fn().mockRejectedValue(new Error('Copy failed'))
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<EmojiPicker />)

    // Add an emoji and copy
    const picker = screen.getByText('emoji-picker-react') as HTMLElement
    const firstEmoji = picker.querySelector('button[title="grinning face"]')
    fireEvent.click(firstEmoji)

    const copyButton = screen.getByText('Copy All to Clipboard')
    fireEvent.click(copyButton)

    await waitFor(() => {
      const error = screen.getByText('Failed to copy to clipboard')
      expect(error).toBeInTheDocument()
      expect(error).toHaveClass('form-error')
    })
  })
})
