import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EmojiPicker from '../pages/EmojiPicker'

vi.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: ({ onEmojiClick }: { onEmojiClick: (data: any) => void }) => (
    <button type="button" onClick={() => onEmojiClick({ emoji: '😀', unified: '1f600' })}>
      Pick Emoji
    </button>
  ),
  EmojiStyle: {
    NATIVE: 'native',
    APPLE: 'apple',
    TWITTER: 'twitter',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
  },
}))

describe('EmojiPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with emoji picker', () => {
    render(<EmojiPicker />)

    expect(screen.getByText('Emoji Picker')).toBeInTheDocument()
    expect(screen.getByText('Search, select, and copy emojis')).toBeInTheDocument()
    expect(screen.getByText('Pick Emoji')).toBeInTheDocument()
  })

  it('adds emoji when clicked', async () => {
    render(<EmojiPicker />)

    fireEvent.click(screen.getByText('Pick Emoji'))

    await waitFor(() => {
      expect(screen.getByText('Selected Emojis')).toBeInTheDocument()
      expect(screen.getByText('😀')).toBeInTheDocument()
    })
  })

  it('copies emojis to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<EmojiPicker />)

    fireEvent.click(screen.getByText('Pick Emoji'))
    fireEvent.click(screen.getByText('Copy All to Clipboard'))

    await waitFor(() => {
      expect(mockClipboard).toHaveBeenCalledWith('😀')
    })
  })
})
