import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

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

function SideNav() {
  const location = useLocation()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set())

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const isCategoryActive = (categoryId: string) => {
    return TOOL_CATEGORIES.some((cat) => cat.id === categoryId && cat.tools.some((tool) => location.pathname === tool.path))
  }

  return (
    <aside className="side-nav">
      <div className="side-nav-header">
        <Link to="/" className="side-nav-brand">
          <span className="brand-mark">LF</span>
          <span className="brand-name">LocalForge</span>
        </Link>
      </div>

      <nav className="side-nav-content">
        {TOOL_CATEGORIES.map((category) => {
          const isActive = isCategoryActive(category.id)
          const isExpanded = expandedCategories.has(category.id)

          return (
            <div key={category.id} className={`side-nav-category ${isActive ? 'active' : ''}`}>
              <button
                type="button"
                className={`side-nav-toggle ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isExpanded}
                aria-controls={`category-${category.id}`}
              >
                <span className="side-nav-toggle-icon">
                  {isExpanded ? '−' : '+'}
                </span>
                <span className="side-nav-category-name">{category.name}</span>
                <span className={`side-nav-badge ${isActive ? 'visible' : ''}`}>
                  {isActive ? '•' : ''}
                </span>
              </button>

              {isExpanded && (
                <ul className="side-nav-tools">
                  {category.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        to={tool.path}
                        className={`side-nav-tool ${location.pathname === tool.path ? 'active' : ''}`}
                        id={`category-${category.id}`}
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      <div className="side-nav-footer">
        <button
          type="button"
          className="side-nav-collapse-all"
          onClick={() => setExpandedCategories(new Set(TOOL_CATEGORIES.map((c) => c.id)))}
        >
          Expand All
        </button>
        <button
          type="button"
          className="side-nav-collapse-all"
          onClick={() => setExpandedCategories(new Set())}
        >
          Collapse All
        </button>
      </div>
    </aside>
  )
}

export default SideNav
