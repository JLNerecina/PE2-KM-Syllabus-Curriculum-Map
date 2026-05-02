import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import Map from '../pages/Map'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

// Mock html2pdf to prevent errors during Map component render
vi.mock('html2pdf.js', () => ({
    default: () => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn()
    })
}))

describe('Map Component - Curriculum Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should only fetch and display curriculum for the registered student', async () => {
    const mockUserId = 'student-neu-edu-123';
    (useAuth as any).mockReturnValue({ session: { user: { id: mockUserId } } })

    const eq2 = vi.fn().mockResolvedValue({ data: [] })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const select = vi.fn().mockReturnValue({ eq: eq1 })

    ;(supabase.from as any).mockReturnValue({ select })

    render(<Map />)

    await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('student_terms')
    })
    
    // Verify visibility constraints: filters by the current user's ID
    expect(eq1).toHaveBeenCalledWith('student_id', mockUserId)
    expect(eq2).toHaveBeenCalledWith('status', 'completed')
  })
})
