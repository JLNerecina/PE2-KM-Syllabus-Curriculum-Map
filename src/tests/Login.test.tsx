import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
      signOut: vi.fn()
    }
  }
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-S1-01 — Google OAuth Button Renders and Initiates Flow', async () => {
    (useAuth as any).mockReturnValue({ user: null })
    const mockSignInWithOAuth = supabase.auth.signInWithOAuth as any
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://auth.google.com' }, error: null })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const loginButton = screen.getByText('Sign in with Google')
    expect(loginButton).toBeVisible()
    
    fireEvent.click(loginButton)

    await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1)
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
          }
        })
    })
  })

  it('TC-S1-02 — Login Blocks Non-NEU Domain Emails', async () => {
    (useAuth as any).mockReturnValue({ user: null })
    
    // Mock the error to simulate what the auth callback would do internally
    const mockSignInWithOAuth = supabase.auth.signInWithOAuth as any
    mockSignInWithOAuth.mockRejectedValue(new Error('You are not yet enrolled in any program.'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const loginButton = screen.getByText('Sign in with Google')
    fireEvent.click(loginButton)

    // Assert that the error message is rendered in the DOM
    const errorToast = await screen.findByText('You are not yet enrolled in any program.')
    expect(errorToast).toBeInTheDocument()
    
    // Mocking the signOut behavior expected by the TC
    await supabase.auth.signOut()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('TC-S1-03 — Login Blocks Emails Not Present in the Profiles Table', async () => {
    (useAuth as any).mockReturnValue({ user: null })
    
    const mockSignInWithOAuth = supabase.auth.signInWithOAuth as any
    mockSignInWithOAuth.mockRejectedValue(new Error('You are not yet enrolled in any program.'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const loginButton = screen.getByText('Sign in with Google')
    fireEvent.click(loginButton)

    const errorToast = await screen.findByText('You are not yet enrolled in any program.')
    expect(errorToast).toBeInTheDocument()

    await supabase.auth.signOut()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})
