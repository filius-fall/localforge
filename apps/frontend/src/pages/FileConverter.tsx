import { Link } from 'react-router-dom'

const converters = [
  {
    slug: 'docx-to-pdf',
    name: 'DOCX → PDF',
    description: 'Convert Microsoft Word documents to PDF format',
    path: '/tools/convert/docx-to-pdf',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M9 15l3 3 3-3" />
      </svg>
    ),
  },
  {
    slug: 'pdf-to-docx',
    name: 'PDF → DOCX',
    description: 'Convert PDF documents to Microsoft Word format',
    path: '/tools/convert/pdf-to-docx',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-4" />
        <path d="M12 14h-2" />
        <path d="M12 14h2" />
      </svg>
    ),
  },
  {
    slug: 'csv-to-xlsx',
    name: 'CSV → XLSX',
    description: 'Convert CSV files to Excel spreadsheet format',
    path: '/tools/convert/csv-to-xlsx',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    slug: 'xlsx-to-csv',
    name: 'XLSX → CSV',
    description: 'Convert Excel spreadsheets to CSV format',
    path: '/tools/convert/xlsx-to-csv',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    slug: 'markdown-to-pdf',
    name: 'Markdown → PDF',
    description: 'Convert Markdown files to PDF documents',
    path: '/tools/convert/markdown-to-pdf',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h6" />
        <path d="M9 11h6" />
      </svg>
    ),
  },
]

function FileConverter() {
  return (
    <section className="tool-page">
      <div className="tool-header">
        <p className="eyebrow">File Converter</p>
        <h1>Convert documents and data locally.</h1>
        <p className="tool-subtitle">
          Choose a converter type below. All conversions happen locally on your machine.
        </p>
      </div>
      <div className="converter-grid">
        {converters.map((converter) => (
          <Link key={converter.slug} to={converter.path} className="converter-card">
            <div className="converter-card-icon">{converter.icon}</div>
            <h2 className="converter-card-title">{converter.name}</h2>
            <p className="converter-card-description">{converter.description}</p>
            <span className="converter-card-link">Open converter →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FileConverter
