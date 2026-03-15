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
  {
    slug: 'emoji',
    name: 'Emoji',
    description: 'Search, select, and copy emojis.',
    path: '/tools/emoji',
  },
  {
    slug: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and copy hex/rgb values.',
    path: '/tools/color-picker',
  },
  {
    slug: 'mock-api',
    name: 'Mock API Server',
    description: 'Create and manage mock API responses.',
    path: '/tools/mock-api',
  },
  {
    slug: 'data-generator',
    name: 'Data Generator',
    description: 'Generate fake profiles, addresses, and company data.',
    path: '/tools/data-generator',
  },
  {
    slug: 'palette-generator',
    name: 'Palette Generator',
    description: 'Extract dominant color palettes from images.',
    path: '/tools/palette-generator',
  },
  {
    slug: 'base-converter',
    name: 'Base Converter',
    description: 'Convert numbers between binary, octal, decimal, and hexadecimal.',
    path: '/tools/base-converter',
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    description: 'Convert colors between HEX and RGB formats.',
    path: '/tools/color-converter',
  },
  {
    slug: 'decision-logger',
    name: 'Decision Logger',
    description: 'Log and track architecture decisions (ADRs).',
    path: '/tools/decision-logger',
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
          <h1>Fast local utilities for everyday work.</h1>
          <p className="hero-copy">
            Pick a tool from the sidebar. Everything runs locally and keeps your data on your machine.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/tools/timezone">
              Open Time Zones
            </Link>
            <Link className="button ghost" to="/tools/html">
              HTML Compiler
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-title">Popular tools</p>
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
