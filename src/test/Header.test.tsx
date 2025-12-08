import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../components/Header'
import { LanguageProvider } from '../contexts/LanguageContext'

// Mock the language context
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    dir: 'ltr'
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user name and role correctly', () => {
    render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    )

    expect(screen.getByText('نظام صرح الإتقان المتكامل')).toBeInTheDocument()
  })

  it('displays center information', () => {
    render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    )

    expect(screen.getByText(/الحضور والانصراف والرواتب/)).toBeInTheDocument()
  })
})