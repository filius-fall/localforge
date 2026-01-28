import { useState } from 'react'
import EmojiPickerWidget, { EmojiStyle } from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'

function EmojiPicker() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiClickData[]>([])
  const [error, setError] = useState<string>('')

  const addEmoji = (emojiData: EmojiClickData) => {
    if (selectedEmojis.some((e) => e.unified === emojiData.unified)) {
      setError('Emoji already selected')
      return
    }
    setSelectedEmojis((prev) => [...prev, emojiData])
    setError('')
  }

  const removeEmoji = (index: number) => {
    const newSelection = [...selectedEmojis]
    newSelection.splice(index, 1)
    setSelectedEmojis(newSelection)
  }

  const copyToClipboard = async () => {
    if (selectedEmojis.length === 0) return

    try {
      const emojiText = selectedEmojis.map((e) => e.emoji).join(' ')
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
            <EmojiPickerWidget
              onEmojiClick={addEmoji}
              emojiStyle={EmojiStyle.NATIVE}
              emojiVersion="14.0"
              previewConfig={{
                showPreview: true,
              }}
            />
          </div>
          <div className="selection-display">
            <h2>Selected Emojis</h2>
            <div className="emoji-list">
              {selectedEmojis.map((e, index) => (
                <div key={e.unified} className="emoji-item">
                  <span className="emoji-char">{e.emoji}</span>
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
