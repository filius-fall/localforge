import { useState } from 'react'
import { LoremIpsum } from 'lorem-ipsum'

function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3)
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(4)
  const [wordsPerSentence, setWordsPerSentence] = useState(8)
  const [totalWords, setTotalWords] = useState('')
  const [output, setOutput] = useState('')

  const generateLorem = () => {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: { min: sentencesPerParagraph, max: sentencesPerParagraph },
      wordsPerSentence: { min: wordsPerSentence, max: wordsPerSentence },
    })

    let text: string
    if (totalWords) {
      const total = parseInt(totalWords, 10)
      const avgWordsPerSentence = Math.round(total / parseInt(totalWords, 10) || 0)
      lorem.generateWords(total, avgWordsPerSentence)
      text = lorem.getWords().join(' ')
    } else {
      text = lorem.generateParagraphs(parseInt(paragraphs, 10)).join('\n\n')
    }

    setOutput(text)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      alert('Failed to copy to clipboard')
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Lorem Ipsum Generator</h1>
        <p className="tool-subtitle">
          Generate placeholder text with configurable length
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <h2>Controls</h2>

          <label className="field">
            <span>Paragraphs</span>
            <input
              type="number"
              min="1"
              max="50"
              value={paragraphs}
              onChange={(e) => setParagraphs(parseInt(e.target.value) || 3)}
            />
          </label>

          <label className="field">
            <span>Sentences per Paragraph</span>
            <input
              type="number"
              min="1"
              max="20"
              value={sentencesPerParagraph}
              onChange={(e) => setSentencesPerParagraph(parseInt(e.target.value) || 4)}
              disabled={totalWords !== ''}
            />
          </label>

          <label className="field">
            <span>Words per Sentence</span>
            <input
              type="number"
              min="1"
              max="30"
              value={wordsPerSentence}
              onChange={(e) => setWordsPerSentence(parseInt(e.target.value) || 8)}
              disabled={totalWords !== ''}
            />
          </label>

          <label className="field">
            <span>Total Words (overrides others)</span>
            <input
              type="number"
              min="1"
              max="1000"
              placeholder="Optional"
              value={totalWords}
              onChange={(e) => setTotalWords(e.target.value)}
            />
          </label>

          <button className="button primary" type="button" onClick={generateLorem}>
            Generate
          </button>
        </div>

        <div className="tool-section">
          <h2>Output</h2>
          <pre className="output-preview">{output || 'Click Generate to create text'}</pre>
          <button
            className="button ghost"
            type="button"
            onClick={copyToClipboard}
            disabled={!output}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </section>
  )
}

export default LoremIpsumGenerator
