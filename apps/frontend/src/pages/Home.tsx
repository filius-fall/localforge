import { Link } from 'react-router-dom'

const tools = [
  {
    slug: 'timezone',
    name: 'Time Zone Converter',
    description: 'Align teams across time zones with instant conversions.',
    path: '/tools/timezone',
  },
  {
    slug: 'image',
    name: 'Image Converter',
    description: 'Convert images to web-ready formats in seconds.',
    path: '/tools/image',
  },
  {
    slug: 'html',
    name: 'HTML Compiler',
    description: 'Live HTML, CSS, and JS preview in a sandbox.',
    path: '/tools/html',
  },
]

function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div>
          <p className="eyebrow">LocalForge Toolkit</p>
          <h1>Shape your day with precise, local-first utilities.</h1>
          <p className="hero-copy">
            Launch into focused tools for teams, creators, and makers. Everything
            stays fast, offline-friendly, and tailored for daily flow.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/tools/timezone">
              Start with Time Zones
            </Link>
            <Link className="button ghost" to="/tools/html">
              Try the HTML Compiler
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-title">Now Serving</p>
            <div className="panel-list">
              <span>Time Zone Converter</span>
              <span>Image Converter</span>
              <span>HTML Compiler</span>
            </div>
            <p className="panel-note">More tools coming soon.</p>
          </div>
        </div>
      </div>
      <div className="tool-grid">
        {tools.map((tool, index) => (
          <Link
            key={tool.slug}
            to={tool.path}
            className="tool-card"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div>
              <p className="tool-label">{tool.name}</p>
              <p className="tool-description">{tool.description}</p>
            </div>
            <span className="tool-link">Open tool</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Home
