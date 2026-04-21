import type { ReactNode } from 'react'
import './PageLayout.css'

interface PageLayoutProps {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, actions, children }: PageLayoutProps) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {actions && <div className="header-actions">{actions}</div>}
      </div>
      <div className="dashboard-inner">
        {children}
      </div>
    </div>
  )
}