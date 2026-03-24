import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../lib/api'

type Tool = {
  slug: string
  name: string
  description: string
  path: string
  icon?: React.ReactNode
}

// Icon components
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" x2="15" y1="20" y2="20" />
    <line x1="12" x2="12" y1="4" y2="20" />
  </svg>
)

const ColorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
)

const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" x2="6" y1="6" y2="6" />
    <line x1="6" x2="6" y1="18" y2="18" />
  </svg>
)

const DataIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const DevIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const fallbackTools: Tool[] = [
  {
    slug: 'timezone',
    name: 'Time Zone Converter',
    description: 'Align teams across time zones with instant conversions.',
    path: '/tools/timezone',
    icon: <ClockIcon />,
  },
  {
    slug: 'time',
    name: 'Timestamp Tools',
    description: 'Epoch converter, cron helper, timezone compare.',
    path: '/tools/time',
    icon: <ClockIcon />,
  },
  {
    slug: 'lorem',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text with configurable length.',
    path: '/tools/lorem',
    icon: <TextIcon />,
  },
  {
    slug: 'emoji',
    name: 'Emoji',
    description: 'Search, select, and copy emojis.',
    path: '/tools/emoji',
    icon: <TextIcon />,
  },
  {
    slug: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and copy hex/rgb values.',
    path: '/tools/color-picker',
    icon: <ColorIcon />,
  },
  {
    slug: 'mock-api',
    name: 'Mock API Server',
    description: 'Create and manage mock API responses.',
    path: '/tools/mock-api',
    icon: <NetworkIcon />,
  },
  {
    slug: 'data-generator',
    name: 'Data Generator',
    description: 'Generate fake profiles, addresses, and company data.',
    path: '/tools/data-generator',
    icon: <DataIcon />,
  },
  {
    slug: 'palette-generator',
    name: 'Palette Generator',
    description: 'Extract dominant color palettes from images.',
    path: '/tools/palette-generator',
    icon: <ColorIcon />,
  },
  {
    slug: 'base-converter',
    name: 'Base Converter',
    description: 'Convert numbers between binary, octal, decimal, and hexadecimal.',
    path: '/tools/base-converter',
    icon: <DevIcon />,
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    description: 'Convert colors between HEX and RGB formats.',
    path: '/tools/color-converter',
    icon: <ColorIcon />,
  },
  {
    slug: 'decision-logger',
    name: 'Decision Logger',
    description: 'Log and track architecture decisions (ADRs).',
    path: '/tools/decision-logger',
    icon: <DevIcon />,
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
            {tool.icon && <div className="tool-card-icon">{tool.icon}</div>}
            <div>
              <p className="tool-label">{tool.name}</p>
              <p className="tool-description">{tool.description}</p>
            </div>
            <span className="tool-link">Open tool <ArrowIcon /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Home
