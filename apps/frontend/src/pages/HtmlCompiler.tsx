import { useMemo, useState, useEffect } from 'react'

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

const tabs = ['html', 'css', 'js'] as const
type EditorTab = (typeof tabs)[number]

function HtmlCompiler() {
  const [html, setHtml] = useState(starter.html)
  const [css, setCss] = useState(starter.css)
  const [js, setJs] = useState(starter.js)
  const [activeTab, setActiveTab] = useState<EditorTab>('html')
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  const editorValue =
    activeTab === 'html' ? html : activeTab === 'css' ? css : js

  const handleEditorChange = (value: string) => {
    if (activeTab === 'html') {
      setHtml(value)
    } else if (activeTab === 'css') {
      setCss(value)
    } else {
      setJs(value)
    }
  }

  // Device dimensions for preview
  const deviceDimensions = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  }

  const currentDimensions = deviceDimensions[deviceView]

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

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
          <div className="button-group">
            <button className="button ghost" type="button" onClick={handleReset}>
              Reset sample
            </button>
            <div className="device-selector">
              <button
                className={`button ${deviceView === 'desktop' ? 'primary' : 'ghost'}`}
                type="button"
                onClick={() => setDeviceView('desktop')}
                title="Desktop view"
              >
                Desktop
              </button>
              <button
                className={`button ${deviceView === 'tablet' ? 'primary' : 'ghost'}`}
                type="button"
                onClick={() => setDeviceView('tablet')}
                title="Tablet view"
              >
                Tablet
              </button>
              <button
                className={`button ${deviceView === 'mobile' ? 'primary' : 'ghost'}`}
                type="button"
                onClick={() => setDeviceView('mobile')}
                title="Mobile view"
              >
                Mobile
              </button>
            </div>
            <button
              className={`button ${isFullscreen ? 'primary' : 'ghost'}`}
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen preview'}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            </button>
          </div>
        </div>
        <div className={`compiler-grid ${isFullscreen ? 'fullscreen-preview' : ''}`}>
          {isFullscreen && (
            <button
              className="fullscreen-exit-button"
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Exit fullscreen preview"
              title="Exit fullscreen preview"
            >
              Back
            </button>
          )}
          <div className="editor-panel">
            <div className="editor-tabs" role="tablist" aria-label="HTML compiler tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`editor-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <label className="editor-card">
              <span className="sr-only">{activeTab.toUpperCase()} editor</span>
              <textarea
                value={editorValue}
                onChange={(event) => handleEditorChange(event.target.value)}
                spellCheck={false}
                autoFocus
              />
            </label>
          </div>
          <div className="preview-pane" style={{ width: currentDimensions.width, height: currentDimensions.height }}>
            {isFullscreen && (
              <div className="preview-controls fullscreen-active">
                <p className="preview-label">Live Preview</p>
                <div className="preview-controls-actions">
                  <div className="preview-device-indicator">{deviceView.charAt(0).toUpperCase() + deviceView.slice(1)}</div>
                  <button
                    className="button primary"
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    title="Exit fullscreen"
                  >
                    Exit fullscreen
                  </button>
                </div>
              </div>
            )}
            {!isFullscreen && (
              <div className="preview-controls">
                <p className="preview-label">Live Preview</p>
                <div className="preview-device-indicator">{deviceView.charAt(0).toUpperCase() + deviceView.slice(1)}</div>
              </div>
            )}
            <iframe
              title="HTML preview"
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              className="preview-frame"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HtmlCompiler
