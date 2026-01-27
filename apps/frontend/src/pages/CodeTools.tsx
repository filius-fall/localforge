import { useState } from 'react'
import prettier from 'prettier/standalone'
import type { Plugin } from 'prettier'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import { minify as minifyJs } from 'terser'

type Language = 'javascript' | 'html' | 'css'

const formatters: Record<Language, { parser: 'babel' | 'html' | 'css'; plugins: Plugin[] }> =
  {
    javascript: { parser: 'babel', plugins: [parserBabel as Plugin] },
    html: { parser: 'html', plugins: [parserHtml as Plugin] },
    css: { parser: 'css', plugins: [parserPostcss as Plugin] },
  }

const minifyCss = (input: string) =>
  input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()

const minifyHtmlSimple = (input: string) =>
  input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()

function CodeTools() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleBeautify = async () => {
    setError(null)
    try {
      const formatter = formatters[language]
      const formatted = await prettier.format(input, {
        parser: formatter.parser,
        plugins: formatter.plugins,
        printWidth: 80,
      })
      setOutput(formatted)
    } catch (err) {
      setError('Beautify failed. Check your code syntax.')
    }
  }

  const handleMinify = async () => {
    setError(null)
    try {
      if (language === 'javascript') {
        const result = await minifyJs(input)
        setOutput(result.code ?? '')
        return
      }
      if (language === 'css') {
        setOutput(minifyCss(input))
        return
      }
      setOutput(minifyHtmlSimple(input))
    } catch (err) {
      setError('Minify failed. Check your code syntax.')
    }
  }

  const handleBase64Encode = () => {
    setError(null)
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
    } catch {
      setError('Base64 encode failed.')
    }
  }

  const handleBase64Decode = () => {
    setError(null)
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
    } catch {
      setError('Base64 decode failed.')
    }
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">Code Tools</p>
        <h1>Beautify, minify, and encode code snippets.</h1>
        <p className="tool-subtitle">
          Format HTML, CSS, and JS with quick Base64 helpers.
        </p>
      </div>
      <div className="tool-panel">
        <div className="form-grid">
          <label className="field">
            <span>Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Input</span>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="button primary" type="button" onClick={handleBeautify}>
            Beautify
          </button>
          <button className="button ghost" type="button" onClick={handleMinify}>
            Minify
          </button>
          <button className="button ghost" type="button" onClick={handleBase64Encode}>
            Base64 Encode
          </button>
          <button className="button ghost" type="button" onClick={handleBase64Decode}>
            Base64 Decode
          </button>
        </div>
        <div className="output-card">
          <p className="preview-label">Output</p>
          <pre>{output}</pre>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  )
}

export default CodeTools
