import { useMemo, useState } from 'react'

const starter = {
  html: `<div class="card">
  <h2>Hello, LocalForge</h2>
  <p>Build quick previews with HTML, CSS, and JS.</p>
  <button id="spark">Spark</button>
</div>`,
  css: `.card {
  font-family: 'Space Grotesk', sans-serif;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(17, 21, 34, 0.12);
  max-width: 360px;
}

button {
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  background: #2f6f6b;
  color: #fff;
  cursor: pointer;
}`,
  js: `document.getElementById('spark')?.addEventListener('click', () => {
  const note = document.createElement('p')
  note.textContent = 'Sparked!'
  document.querySelector('.card')?.appendChild(note)
})`,
}

function HtmlCompiler() {
  const [html, setHtml] = useState(starter.html)
  const [css, setCss] = useState(starter.css)
  const [js, setJs] = useState(starter.js)

  const srcDoc = useMemo(
    () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>${js}<\/script>
  </body>
</html>`,
    [html, css, js]
  )

  const handleReset = () => {
    setHtml(starter.html)
    setCss(starter.css)
    setJs(starter.js)
  }

  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">HTML Compiler</p>
        <h1>Prototype HTML, CSS, and JS instantly.</h1>
        <p className="tool-subtitle">
          Experiment safely in a sandboxed preview.
        </p>
      </div>
      <div className="tool-panel">
        <div className="action-row">
          <button className="button ghost" type="button" onClick={handleReset}>
            Reset sample
          </button>
        </div>
        <div className="compiler-grid">
          <div className="editor-stack">
            <label className="editor-card">
              <span>HTML</span>
              <textarea
                value={html}
                onChange={(event) => setHtml(event.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="editor-card">
              <span>CSS</span>
              <textarea
                value={css}
                onChange={(event) => setCss(event.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="editor-card">
              <span>JavaScript</span>
              <textarea
                value={js}
                onChange={(event) => setJs(event.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
          <div className="preview-pane">
            <p className="preview-label">Live Preview</p>
            <iframe title="HTML preview" sandbox="allow-scripts" srcDoc={srcDoc} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HtmlCompiler
