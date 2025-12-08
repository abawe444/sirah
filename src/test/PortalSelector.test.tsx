import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PortalSelector } from '../components/PortalSelector'
import { LanguageProvider } from '../contexts/LanguageContext'

// Mock the language context
const mockT = vi.fn((key: string) => key)
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: mockT,
    dir: 'ltr'
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('PortalSelector', () => {
  const mockOnSelectPortal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders portal options correctly', () => {
    render(
      <LanguageProvider>
        <PortalSelector onSelectPortal={mockOnSelectPortal} />
      </LanguageProvider>
    )

    expect(screen.getByTestId('portal-card-admin')).toBeInTheDocument()
    expect(screen.getByTestId('portal-card-employee')).toBeInTheDocument()
  })

  it('calls onSelectPortal with admin when admin button is clicked', () => {
    render(
      <LanguageProvider>
        <PortalSelector onSelectPortal={mockOnSelectPortal} />
      </LanguageProvider>
    )

    const adminButton = screen.getByTestId('portal-btn-admin')
    fireEvent.click(adminButton)

    expect(mockOnSelectPortal).toHaveBeenCalledWith('admin')
  })

  it('calls onSelectPortal with employee when employee button is clicked', () => {
    render(
      <LanguageProvider>
        <PortalSelector onSelectPortal={mockOnSelectPortal} />
      </LanguageProvider>
    )

    const employeeButton = screen.getByTestId('portal-btn-employee')
    fireEvent.click(employeeButton)

    expect(mockOnSelectPortal).toHaveBeenCalledWith('employee')
  })

  it('displays correct descriptions', () => {
    render(
      <LanguageProvider>
        <PortalSelector onSelectPortal={mockOnSelectPortal} />
      </LanguageProvider>
    )

    expect(screen.getByTestId('portal-card-admin')).toBeInTheDocument()
    expect(screen.getByTestId('portal-card-employee')).toBeInTheDocument()
  })
})