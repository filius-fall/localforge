import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SideNav from './SideNav'

interface ToolLayoutProps {
  children: React.ReactNode
}

function ToolLayout({ children }: ToolLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('side-nav-open', navOpen)
    return () => document.body.classList.remove('side-nav-open')
  }, [navOpen])

  return (
    <div className="tool-layout">
      <button
        type="button"
        className="side-nav-mobile-toggle"
        onClick={() => setNavOpen((prev) => !prev)}
        aria-expanded={navOpen}
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
      >
        <span aria-hidden>Menu</span>
      </button>
      {navOpen ? (
        <button
          type="button"
          className="side-nav-backdrop"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}
      <SideNav />
      <main className="tool-layout-main">
        <div className="tool-layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default ToolLayout
