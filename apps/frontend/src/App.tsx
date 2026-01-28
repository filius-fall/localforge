import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ClipboardHistory from './pages/ClipboardHistory'
import CodeTools from './pages/CodeTools'
import FileConverter from './pages/FileConverter'
import HtmlCompiler from './pages/HtmlCompiler'
import ImageConverter from './pages/ImageConverter'
import MediaToolkit from './pages/MediaToolkit'
import NetworkTools from './pages/NetworkTools'
import NotesSnippets from './pages/NotesSnippets'
import PdfToolkit from './pages/PdfToolkit'
import QrGenerator from './pages/QrGenerator'
import TextUtilities from './pages/TextUtilities'
import TimestampTools from './pages/TimestampTools'
import TimezoneConverter from './pages/TimezoneConverter'
import EmojiPicker from './pages/EmojiPicker'
import ColorPicker from './pages/ColorPicker'
import MockApiServer from './pages/MockApiServer'
import DataGenerator from './pages/DataGenerator'
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
            <NavLink to="/tools/pdf" className={navLinkClass}>
              PDF
            </NavLink>
            <NavLink to="/tools/convert" className={navLinkClass}>
              Convert
            </NavLink>
            <NavLink to="/tools/media" className={navLinkClass}>
              Media
            </NavLink>
            <NavLink to="/tools/text" className={navLinkClass}>
              Text
            </NavLink>
            <NavLink to="/tools/qr" className={navLinkClass}>
              QR
            </NavLink>
            <NavLink to="/tools/network" className={navLinkClass}>
              Network
            </NavLink>
            <NavLink to="/tools/code" className={navLinkClass}>
              Code
            </NavLink>
            <NavLink to="/tools/clipboard" className={navLinkClass}>
              Clipboard
            </NavLink>
            <NavLink to="/tools/time" className={navLinkClass}>
              Time
            </NavLink>
            <NavLink to="/tools/lorem" className={navLinkClass}>
              Lorem
            </NavLink>
            <NavLink to="/tools/emoji" className={navLinkClass}>
              Emoji
            </NavLink>
            <NavLink to="/tools/color-picker" className={navLinkClass}>
              Color
            </NavLink>
            <NavLink to="/tools/mock-api" className={navLinkClass}>
              Mock API
            </NavLink>
            <NavLink to="/tools/data-generator" className={navLinkClass}>
              Data Generator
            </NavLink>
            <NavLink to="/tools/notes" className={navLinkClass}>
              Notes
            </NavLink>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
             <Route path="/tools/timezone" element={<TimezoneConverter />} />
             <Route path="/tools/image" element={<ImageConverter />} />
             <Route path="/tools/html" element={<HtmlCompiler />} />
             <Route path="/tools/pdf" element={<PdfToolkit />} />
             <Route path="/tools/convert" element={<FileConverter />} />
             <Route path="/tools/media" element={<MediaToolkit />} />
             <Route path="/tools/text" element={<TextUtilities />} />
             <Route path="/tools/qr" element={<QrGenerator />} />
             <Route path="/tools/network" element={<NetworkTools />} />
             <Route path="/tools/code" element={<CodeTools />} />
             <Route path="/tools/clipboard" element={<ClipboardHistory />} />
             <Route path="/tools/time" element={<TimestampTools />} />
             <Route path="/tools/notes" element={<NotesSnippets />} />
             <Route path="/tools/lorem" element={<LoremIpsumGenerator />} />
             <Route path="/tools/emoji" element={<EmojiPicker />} />
             <Route path="/tools/color-picker" element={<ColorPicker />} />
             <Route path="/tools/mock-api" element={<MockApiServer />} />
             <Route path="/tools/data-generator" element={<DataGenerator />} />
           </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
