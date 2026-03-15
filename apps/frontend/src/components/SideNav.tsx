import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../SideNav.css'

interface Tool {
  slug: string
  name: string
  path: string
  icon?: string
}

interface Category {
  id: string
  name: string
  tools: Tool[]
}

const TOOL_CATEGORIES: Category[] = [
  {
    id: 'time',
    name: 'Time & Date',
    tools: [
      { slug: 'timezone', name: 'Time Zone Converter', path: '/tools/timezone' },
      { slug: 'time', name: 'Timestamp Tools', path: '/tools/time' },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    tools: [
      { slug: 'color-picker', name: 'Color Picker', path: '/tools/color-picker' },
      { slug: 'color-converter', name: 'Color Converter', path: '/tools/color-converter' },
      { slug: 'palette-generator', name: 'Palette Generator', path: '/tools/palette-generator' },
    ],
  },
  {
    id: 'text',
    name: 'Text & Code',
    tools: [
      { slug: 'lorem', name: 'Lorem Ipsum', path: '/tools/lorem' },
      { slug: 'base-converter', name: 'Base Converter', path: '/tools/base-converter' },
      { slug: 'emoji', name: 'Emoji Picker', path: '/tools/emoji' },
    ],
  },
  {
    id: 'data',
    name: 'Data & Files',
    tools: [
      { slug: 'data-generator', name: 'Data Generator', path: '/tools/data-generator' },
      { slug: 'convert', name: 'File Converter', path: '/tools/convert' },
      { slug: 'clipboard', name: 'Clipboard History', path: '/tools/clipboard' },
      { slug: 'notes', name: 'Notes & Snippets', path: '/tools/notes' },
    ],
  },
  {
    id: 'network',
    name: 'Network & Code',
    tools: [
      { slug: 'network', name: 'Network Tools', path: '/tools/network' },
      { slug: 'code', name: 'Code Tools', path: '/tools/code' },
      { slug: 'qr', name: 'QR Generator', path: '/tools/qr' },
      { slug: 'mock-api', name: 'Mock API Server', path: '/tools/mock-api' },
    ],
  },
  {
    id: 'media',
    name: 'Media & Documents',
    tools: [
      { slug: 'image', name: 'Image Toolkit', path: '/tools/image' },
      { slug: 'html', name: 'HTML Compiler', path: '/tools/html' },
      { slug: 'pdf', name: 'PDF Toolkit', path: '/tools/pdf' },
      { slug: 'media', name: 'Media Toolkit', path: '/tools/media' },
    ],
  },
  {
    id: 'dev',
    name: 'Development',
    tools: [
      { slug: 'decision-logger', name: 'Decision Logger', path: '/tools/decision-logger' },
    ],
  },
]

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function SideNav() {
  const location = useLocation()
  const [theme, setTheme] = useState(getPreferredTheme)
  const isHome = location.pathname === '/'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <aside className="side-nav" aria-label="Tool navigation">
      <div className="side-nav-header">
        <Link to="/" className="side-nav-brand">
          LocalForge
        </Link>
        <p className="side-nav-caption">Local-first utilities</p>
      </div>

      <nav className="side-nav-content">
        <Link to="/" className={`side-nav-home ${isHome ? 'active' : ''}`}>
          Home
        </Link>
        {TOOL_CATEGORIES.map((category) => (
          <div key={category.id} className="side-nav-group">
            <p className="side-nav-group-title">{category.name}</p>
            <div className="side-nav-group-links">
              {category.tools.map((tool) => (
                <Link
                  key={tool.slug}
                  to={tool.path}
                  className={`side-nav-tool ${location.pathname === tool.path ? 'active' : ''}`}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="side-nav-footer">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === 'dark'}
        >
          <span className="theme-toggle-label">Theme</span>
          <span className="theme-toggle-value">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </aside>
  )
}

export default SideNav
