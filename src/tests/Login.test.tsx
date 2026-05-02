import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    }
  }
}))

describe('Login Component - Email Domain Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it('should initiate login process for Google authentication', async () => {
    (useAuth as any).mockReturnValue({ user: null })
    const mockSignInWithOAuth = supabase.auth.signInWithOAuth as any
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://auth.google.com' }, error: null })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const loginButton = screen.getByText('Sign in with Google')
    fireEvent.click(loginButton)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
      }
    })
  })

  it('should display error if a non-student account tries to log in (@student.neu.edu requirement)', async () => {
    (useAuth as any).mockReturnValue({ user: null })
    const mockSignInWithOAuth = supabase.auth.signInWithOAuth as any
    
    // Simulate Supabase rejecting the login due to invalid domain policy
    mockSignInWithOAuth.mockRejectedValue(new Error('Unauthorized domain. Only @student.neu.edu accounts can login.'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const loginButton = screen.getByText('Sign in with Google')
    fireEvent.click(loginButton)

    // Wait for error state
    const errorToast = await screen.findByText('Unauthorized domain. Only @student.neu.edu accounts can login.')
    expect(errorToast).toBeInTheDocument()
  })
})
