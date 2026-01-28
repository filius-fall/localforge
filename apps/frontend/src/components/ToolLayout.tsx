import SideNav from './SideNav'

interface ToolLayoutProps {
  children: React.ReactNode
}

function ToolLayout({ children }: ToolLayoutProps) {
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
