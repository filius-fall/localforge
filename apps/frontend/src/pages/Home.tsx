import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../lib/api'

type Tool = {
  slug: string
  name: string
  description: string
  path: string
}

const fallbackTools: Tool[] = [
  {
    slug: 'timezone',
    name: 'Time Zone Converter',
    description: 'Align teams across time zones with instant conversions.',
    path: '/tools/timezone',
  },
  {
    slug: 'time',
    name: 'Timestamp Tools',
    description: 'Epoch converter, cron helper, timezone compare.',
    path: '/tools/time',
  },
  {
    slug: 'lorem',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text with configurable length.',
    path: '/tools/lorem',
  },
]

function Home() {
  const [tools, setTools] = useState<Tool[]>(fallbackTools)

  useEffect(() => {
    let mounted = true
    getJson<Tool[]>('/api/tools')
      .then((data) => {
        if (mounted && data.length > 0) {
          setTools(data)
        }
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [])

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
            <span>Image Toolkit</span>
            <span>HTML Compiler</span>
            <span>PDF Toolkit</span>
            <span>File Converter</span>
            <span>Video & Audio Tools</span>
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
