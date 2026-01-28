import { useState } from 'react'

const BASES = [
  { value: 2, label: 'Binary (2)' },
  { value: 8, label: 'Octal (8)' },
  { value: 10, label: 'Decimal (10)' },
  { value: 16, label: 'Hexadecimal (16)' },
]

function BaseConverter() {
  const [input, setInput] = useState<string>('')
  const [inputBase, setInputBase] = useState<number>(10)
  const [outputBase, setOutputBase] = useState<number>(16)
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')

  const isValidForBase = (value: string, base: number): boolean => {
    try {
      const num = parseInt(value, base)
      return !isNaN(num) && num.toString(base).toUpperCase() === value.toUpperCase()
    } catch {
      return false
    }
  }

  const convertNumber = () => {
    setError('')

    if (!input.trim()) {
      setOutput('')
      return
    }

    if (!isValidForBase(input, inputBase)) {
      setError(`Invalid number for base ${inputBase}`)
      setOutput('')
      return
    }

    try {
      const decimalValue = parseInt(input, inputBase)
      if (isNaN(decimalValue)) {
        setError('Invalid number')
        setOutput('')
        return
      }
      const converted = decimalValue.toString(outputBase).toUpperCase()
      setOutput(converted)
    } catch {
      setError('Conversion failed')
      setOutput('')
    }
  }

  const swapBases = () => {
    const temp = inputBase
    setInputBase(outputBase)
    setOutputBase(temp)

    // Also swap input/output if we have valid values
    if (output && isValidForBase(output, outputBase)) {
      setInput(output)
      setOutput(input)
    }
  }

  const copyToClipboard = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError('')
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <h1>Base Converter</h1>
        <p className="tool-subtitle">
          Convert numbers between different bases (binary, octal, decimal, hexadecimal)
        </p>
      </div>

      <div className="tool-panel">
        <div className="tool-section">
          <div className="form-group">
            <label htmlFor="input-base">Input Base</label>
            <select
              id="input-base"
              value={inputBase}
              onChange={(e) => setInputBase(Number(e.target.value))}
              className="input"
            >
              {BASES.map((base) => (
                <option key={base.value} value={base.value}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="input-number">Input Number</label>
            <input
              id="input-number"
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Enter number in base ${inputBase}`}
              className="input"
            />
          </div>

          <div className="swap-button-container">
            <button
              className="button secondary"
              type="button"
              onClick={swapBases}
              title="Swap input and output bases"
            >
              ⇄ Swap Bases
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="output-base">Output Base</label>
            <select
              id="output-base"
              value={outputBase}
              onChange={(e) => setOutputBase(Number(e.target.value))}
              className="input"
            >
              {BASES.map((base) => (
                <option key={base.value} value={base.value}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-row">
            <button
              className="button primary"
              type="button"
              onClick={convertNumber}
              disabled={!input}
            >
              Convert
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={clearAll}
              disabled={!input && !output}
            >
              Clear
            </button>
          </div>
        </div>

        {output && (
          <div className="tool-section">
            <h2>Result</h2>
            <div className="result-display">
              <div className="result-value">{output}</div>
              <div className="result-meta">
                <span>Base {outputBase}</span>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default BaseConverter
