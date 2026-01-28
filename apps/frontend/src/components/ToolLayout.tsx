import { useLocation } from 'react-router-dom'
import SideNav from './SideNav'

interface ToolLayoutProps {
  children: React.ReactNode
}

function ToolLayout({ children }: ToolLayoutProps) {
  const location = useLocation()

  return (
    <div className="tool-layout">
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
