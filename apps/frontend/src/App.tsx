import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import HtmlCompiler from './pages/HtmlCompiler'
import ImageConverter from './pages/ImageConverter'
import TimezoneConverter from './pages/TimezoneConverter'
import './App.css'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active' : ''}`

function App() {
  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark">LF</div>
            <div>
              <p className="brand-title">LocalForge</p>
              <p className="brand-subtitle">Local tools. Global reach.</p>
            </div>
          </div>
          <nav className="app-nav">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/tools/timezone" className={navLinkClass}>
              Time Zone
            </NavLink>
            <NavLink to="/tools/image" className={navLinkClass}>
              Image
            </NavLink>
            <NavLink to="/tools/html" className={navLinkClass}>
              HTML
            </NavLink>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/timezone" element={<TimezoneConverter />} />
            <Route path="/tools/image" element={<ImageConverter />} />
            <Route path="/tools/html" element={<HtmlCompiler />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
