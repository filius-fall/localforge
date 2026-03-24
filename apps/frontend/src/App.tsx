import { Route, Routes } from 'react-router-dom'
import ToolLayout from './components/ToolLayout'
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
import LoremIpsumGenerator from './pages/LoremIpsumGenerator'
import EmojiPicker from './pages/EmojiPicker'
import ColorPicker from './pages/ColorPicker'
import MockApiServer from './pages/MockApiServer'
import DataGenerator from './pages/DataGenerator'
import PaletteGenerator from './pages/PaletteGenerator'
import BaseConverter from './pages/BaseConverter'
import ColorConverter from './pages/ColorConverter'
import DecisionLogger from './pages/DecisionLogger'
// File Converter sub-pages
import DocxToPdf from './pages/convert/DocxToPdf'
import PdfToDocx from './pages/convert/PdfToDocx'
import CsvToXlsx from './pages/convert/CsvToXlsx'
import XlsxToCsv from './pages/convert/XlsxToCsv'
import MarkdownToPdf from './pages/convert/MarkdownToPdf'
import './App.css'

function App() {
  return (
    <ToolLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/timezone" element={<TimezoneConverter />} />
        <Route path="/tools/image" element={<ImageConverter />} />
        <Route path="/tools/html" element={<HtmlCompiler />} />
        <Route path="/tools/pdf" element={<PdfToolkit />} />
        <Route path="/tools/convert" element={<FileConverter />} />
        <Route path="/tools/convert/docx-to-pdf" element={<DocxToPdf />} />
        <Route path="/tools/convert/pdf-to-docx" element={<PdfToDocx />} />
        <Route path="/tools/convert/csv-to-xlsx" element={<CsvToXlsx />} />
        <Route path="/tools/convert/xlsx-to-csv" element={<XlsxToCsv />} />
        <Route path="/tools/convert/markdown-to-pdf" element={<MarkdownToPdf />} />
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
        <Route path="/tools/palette-generator" element={<PaletteGenerator />} />
        <Route path="/tools/base-converter" element={<BaseConverter />} />
        <Route path="/tools/color-converter" element={<ColorConverter />} />
        <Route path="/tools/decision-logger" element={<DecisionLogger />} />
      </Routes>
    </ToolLayout>
  )
}

export default App
