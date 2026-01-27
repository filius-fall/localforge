import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('App shell', () => {
  it('renders the brand and navigation', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('LocalForge')).toBeInTheDocument()
    expect(screen.getByText('Time Zone')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('HTML')).toBeInTheDocument()
  })
})
