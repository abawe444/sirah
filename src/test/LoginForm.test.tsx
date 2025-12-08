import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../components/LoginForm'

// Mock the language context
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    dir: 'ltr'
  })
}))

describe('LoginForm', () => {
  const mockOnLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(
      <LoginForm
        role="admin"
        onLogin={mockOnLogin}
        error=""
      />
    )

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('calls onLogin with correct credentials', async () => {
    render(
      <LoginForm
        role="admin"
        onLogin={mockOnLogin}
        error=""
      />
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'secure123!' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('admin', 'secure123!')
    })
  })

  it('shows error message when provided', () => {
    const errorMessage = 'Invalid credentials'
    render(
      <LoginForm
        role="admin"
        onLogin={mockOnLogin}
        error={errorMessage}
      />
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})