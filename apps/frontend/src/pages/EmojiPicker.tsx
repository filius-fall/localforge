import { useState } from 'react'
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react'

function EmojiPicker() {
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
  const [emoji, setEmoji] = useState<EmojiClickData | null>(null)
  const [error, setError] = useState<string>('')

  const addEmoji = (emojiData: EmojiClickData) => {
    if (selectedEmojis.some(e => e.unified === emoji.unified)) {
      setError('Emoji already selected')
      return
    }
    setSelectedEmojis([...selectedEmojis, emojiData])
    setEmoji(emojiData)
    setError('')
  }

  const removeEmoji = (index: number) => {
    const newSelection = [...selectedEmojis]
    newSelection.splice(index, 1)
    setSelectedEmojis(newSelection)
    setEmoji(newSelection.length > 0 ? newSelection[0] : null)
  }

  const copyToClipboard = async () => {
    if (selectedEmojis.length === 0) return

    try {
      const emojiText = selectedEmojis.map(e => e.native).join(' ')
      await navigator.clipboard.writeText(emojiText)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Emoji Picker</h1>
        <p className="tool-subtitle">
          Search, select, and copy emojis
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <div className="emoji-picker-wrapper">
            <EmojiPicker
              onEmojiClick={addEmoji}
              emojiStyle={{ fontSize: '24px' }}
              previewConfig={{
                showPreview: true,
                emojiVersion: '14.0',
              }}
            />
          </div>
          <div className="selection-display">
            <h2>Selected Emojis</h2>
            <div className="emoji-list">
              {selectedEmojis.map((e, index) => (
                <div key={e.unified} className="emoji-item">
                  <span className="emoji-char">{e.native}</span>
                  <button
                    className="emoji-remove"
                    type="button"
                    onClick={() => removeEmoji(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="tool-section">
          <button
            className="button primary"
            type="button"
            onClick={copyToClipboard}
            disabled={selectedEmojis.length === 0}
          >
            Copy All to Clipboard
          </button>
        </div>
      </div>
    </section>
  )
}

export default EmojiPicker
