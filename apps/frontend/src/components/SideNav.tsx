import { useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../SideNav.css'
import logoIconMono from '/localforge-icon-mono.svg'

interface Tool {
  slug: string
  name: string
  path: string
  subtools?: Tool[]
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
      {
        slug: 'convert',
        name: 'File Converter',
        path: '/tools/convert',
        subtools: [
          { slug: 'docx-to-pdf', name: 'DOCX → PDF', path: '/tools/convert/docx-to-pdf' },
          { slug: 'pdf-to-docx', name: 'PDF → DOCX', path: '/tools/convert/pdf-to-docx' },
          { slug: 'csv-to-xlsx', name: 'CSV → XLSX', path: '/tools/convert/csv-to-xlsx' },
          { slug: 'xlsx-to-csv', name: 'XLSX → CSV', path: '/tools/convert/xlsx-to-csv' },
          { slug: 'markdown-to-pdf', name: 'Markdown → PDF', path: '/tools/convert/markdown-to-pdf' },
        ],
      },
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

type Theme = 'light' | 'dark' | 'sepia'

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark' || stored === 'sepia') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const themeIcons: Record<Theme, React.ReactElement> = {
  light: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  dark: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  sepia: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
}

const categoryIcons: Record<string, React.ReactElement> = {
  time: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  color: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  text: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" x2="15" y1="20" y2="20" />
      <line x1="12" x2="12" y1="4" y2="20" />
    </svg>
  ),
  data: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" x2="6" y1="6" y2="6" />
      <line x1="6" x2="6" y1="18" y2="18" />
    </svg>
  ),
  media: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  dev: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
}

const homeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

function SideNav() {
  const location = useLocation()
  const [theme, setTheme] = useState<Theme>(getPreferredTheme)
  const [expanded, setExpanded] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const isHome = location.pathname === '/'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Close drawer when route changes
    setOpenDrawer(null)
  }, [location.pathname])

  // Close search when navigating
  useEffect(() => {
    setSearchQuery('')
    setSearchOpen(false)
  }, [location.pathname])

  // Handle Escape key to close search
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [searchOpen])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'sepia'
      return 'light'
    })
  }

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  const openCategoryDrawer = (categoryId: string, tool?: Tool) => {
    if (expanded) {
      // If expanded, toggle inline expansion
      // If tool has subtools, toggle subcategory expansion
      if (tool?.subtools) {
        setExpandedSubcategory((prev) => (prev === tool.slug ? null : tool.slug))
      } else {
        setExpandedCategory((prev) => (prev === categoryId ? null : categoryId))
      }
    } else {
      setOpenDrawer(categoryId)
    }
  }

  const toggleSubcategory = (toolSlug: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setExpandedSubcategory((prev) => (prev === toolSlug ? null : toolSlug))
  }

  const closeDrawer = () => {
    setOpenDrawer(null)
  }

  // Check if a path is active
  const isActive = (path: string) => location.pathname === path

  // Get active category (including subtools)
  const activeCategory = TOOL_CATEGORIES.find((cat) =>
    cat.tools.some((tool) =>
      tool.path === location.pathname ||
      tool.subtools?.some((sub) => sub.path === location.pathname)
    )
  )

  // Flatten all tools for search (including subtools)
  const allTools = TOOL_CATEGORIES.flatMap((cat) =>
    cat.tools.flatMap((tool) => {
      if (tool.subtools) {
        return tool.subtools.map((sub) => ({ ...sub, categoryId: cat.id, categoryName: cat.name, parentTool: tool }))
      }
      return { ...tool, categoryId: cat.id, categoryName: cat.name }
    })
  )

  // Filter tools based on search query
  const searchResults = searchQuery.trim()
    ? allTools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const openSearchModal = () => {
    setSearchOpen(true)
    // Focus input after modal opens
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }

  const closeSearchModal = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <aside className={`side-nav ${expanded ? 'expanded' : ''}`} aria-label="Tool navigation">
        <div className="side-nav-header">
          <Link to="/" className="side-nav-brand">
            <img src={logoIconMono} alt="LocalForge" className="brand-mark" />
            <span className="brand-text">
              <div>LocalForge</div>
              <div className="side-nav-caption">Local-first utilities</div>
            </span>
          </Link>
        </div>

        {/* Search Bar Button */}
        <div className="side-nav-search">
          <button
            type="button"
            className="search-trigger"
            onClick={openSearchModal}
            aria-label="Search tools"
          >
            <span className="search-trigger-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <span className="search-trigger-text">Search</span>
          </button>
        </div>

        <nav className="side-nav-content">
          <Link
            to="/"
            className={`side-nav-home ${isHome ? 'active' : ''}`}
            onClick={() => closeDrawer()}
          >
            <span className="nav-icon">{homeIcon}</span>
            <span className="side-nav-home-text">Home</span>
            <span className="nav-tooltip">Home</span>
          </Link>

          {TOOL_CATEGORIES.map((category) => {
            const isCatActive = activeCategory?.id === category.id
            const isInlineExpanded = expandedCategory === category.id
            return (
              <div key={category.id}>
                <button
                  type="button"
                  className={`nav-category ${isCatActive ? 'active' : ''}`}
                  onClick={() => openCategoryDrawer(category.id)}
                >
                  <span className="nav-icon">{categoryIcons[category.id] || homeIcon}</span>
                  <span className="nav-category-text">{category.name}</span>
                  <span className="nav-tooltip">{category.name}</span>
                  {expanded && (
                    <span className="nav-expand-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isInlineExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  )}
                </button>
                {expanded && isInlineExpanded && (
                  <div className="nav-tool-list">
                    {category.tools.map((tool) => {
                      const hasSubtools = tool.subtools && tool.subtools.length > 0
                      const isSubExpanded = expandedSubcategory === tool.slug
                      const isToolActive = isActive(tool.path) || tool.subtools?.some((sub) => isActive(sub.path))
                      return (
                        <div key={tool.slug}>
                          {hasSubtools ? (
                            <>
                              <div
                                className={`nav-tool-link ${isToolActive ? 'active' : ''} ${isSubExpanded ? 'nav-subcategory-expanded' : ''}`}
                                onClick={(e) => toggleSubcategory(tool.slug, e)}
                              >
                                <span className="nav-tool-link-text">{tool.name}</span>
                                <span className="nav-subcategory-indicator">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="9 18 15 12 9 6" />
                                  </svg>
                                </span>
                              </div>
                              {isSubExpanded && (
                                <div className="nav-subtool-list">
                                  {tool.subtools!.map((sub) => (
                                    <Link
                                      key={sub.slug}
                                      to={sub.path}
                                      className={`nav-subtool-link ${isActive(sub.path) ? 'active' : ''}`}
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              to={tool.path}
                              className={`nav-tool-link ${isToolActive ? 'active' : ''}`}
                            >
                              {tool.name}
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="side-nav-footer">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Current theme: ${theme}. Click to change theme.`}
          >
            <span className="theme-toggle-icon">{themeIcons[theme]}</span>
            <span className="theme-toggle-text">
              <span className="theme-toggle-label">Theme</span>
              <span className="theme-toggle-value">
                {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Sepia'}
              </span>
            </span>
          </button>

          <button
            type="button"
            className="collapse-toggle"
            onClick={toggleExpanded}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <span className="collapse-toggle-text">Collapse</span>
          </button>
        </div>
      </aside>

      {/* Search Modal */}
      <div
        className={`search-modal-backdrop ${searchOpen ? 'open' : ''}`}
        onClick={closeSearchModal}
        aria-hidden="true"
      />
      <div className={`search-modal ${searchOpen ? 'open' : ''}`} role="dialog" aria-label="Search tools">
            <div className="search-modal-header">
              <div className="search-input-wrapper">
                <span className="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                  aria-label="Search tools"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                className="search-modal-close"
                onClick={closeSearchModal}
                aria-label="Close search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="search-modal-content">
              {searchQuery.trim() ? (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <div className="search-results-header">
                        <span className="search-results-count">{searchResults.length} tools found</span>
                      </div>
                      <div className="search-results-list">
                        {searchResults.map((tool) => (
                          <Link
                            key={tool.path}
                            to={tool.path}
                            className={`search-result-item ${isActive(tool.path) ? 'active' : ''}`}
                            onClick={closeSearchModal}
                          >
                            <span className="search-result-icon">{categoryIcons[tool.categoryId] || homeIcon}</span>
                            <div className="search-result-info">
                              <span className="search-result-name">{tool.name}</span>
                              <span className="search-result-category">{tool.categoryName}</span>
                            </div>
                            {isActive(tool.path) && (
                              <span className="search-result-current">Current</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="search-results-empty">
                      <span className="search-empty-icon">🔍</span>
                      <span className="search-empty-text">No tools found matching "{searchQuery}"</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="search-results-empty">
                  <span className="search-empty-icon">🔍</span>
                  <span className="search-empty-text">Type to search for tools</span>
                  <span className="search-empty-hint">Try: "pdf", "color", "time", "image", etc.</span>
                </div>
              )}
            </div>
          </div>

      {/* Tool Drawer */}
      {openDrawer && (
        <>
          <div
            className={`tool-drawer-backdrop ${openDrawer ? 'open' : ''}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className={`tool-drawer ${openDrawer ? 'open' : ''}`} role="dialog" aria-label="Tools">
            <div className="tool-drawer-header">
              <h2 className="tool-drawer-title">
                {TOOL_CATEGORIES.find((c) => c.id === openDrawer)?.name}
              </h2>
              <button
                type="button"
                className="tool-drawer-close"
                onClick={closeDrawer}
                aria-label="Close drawer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="tool-drawer-content">
              {TOOL_CATEGORIES.find((c) => c.id === openDrawer)?.tools.map((tool) => {
                const hasSubtools = tool.subtools && tool.subtools.length > 0
                const isSubExpanded = expandedSubcategory === tool.slug
                const isToolActive = isActive(tool.path) || tool.subtools?.some((sub) => isActive(sub.path))
                return (
                  <div key={tool.slug}>
                    {hasSubtools ? (
                      <>
                        <div
                          className={`tool-drawer-link ${isToolActive ? 'active' : ''} ${isSubExpanded ? 'tool-drawer-subcategory-expanded' : ''}`}
                          onClick={() => setExpandedSubcategory((prev) => (prev === tool.slug ? null : tool.slug))}
                        >
                          <span className="tool-drawer-link-text">{tool.name}</span>
                          <span className="tool-drawer-subcategory-indicator">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                        </div>
                        {isSubExpanded && (
                          <div className="tool-drawer-subtool-list">
                            {tool.subtools!.map((sub) => (
                              <Link
                                key={sub.slug}
                                to={sub.path}
                                className={`tool-drawer-subtool-link ${isActive(sub.path) ? 'active' : ''}`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        key={tool.slug}
                        to={tool.path}
                        className={`tool-drawer-link ${isToolActive ? 'active' : ''}`}
                      >
                        {tool.name}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Nav (shown only on small screens via CSS) */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <div className="bottom-nav-list">
          <Link to="/" className={`bottom-nav-item ${isHome ? 'active' : ''}`}>
            <span className="bottom-nav-icon">{homeIcon}</span>
            <span className="bottom-nav-label">Home</span>
          </Link>
          {TOOL_CATEGORIES.map((category) => {
            const isCatActive = activeCategory?.id === category.id
            return (
              <Link
                key={category.id}
                to={category.tools[0]?.path || '#'}
                className={`bottom-nav-item ${isCatActive ? 'active' : ''}`}
              >
                <span className="bottom-nav-icon">{categoryIcons[category.id] || homeIcon}</span>
                <span className="bottom-nav-label">{category.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default SideNav
