import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Tracker from '../pages/Tracker'
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

describe('Prerequisite Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-S1-06 — Locked Course Checkbox Is Disabled When Prerequisite Is Incomplete', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'user1' } } })
    
    ;(supabase.from as any).mockImplementation((table: string) => {
        const data = table === 'courses' ? [
            { id: 'cs111', code: 'CS 111', title: 'Intro to Programming', units: 3, year_level: 1, semester: 1 },
            { id: 'cs212', code: 'CS 212', title: 'Data Structures', units: 3, year_level: 1, semester: 2 }
        ] : table === 'course_prerequisites' ? [
            { course_id: 'cs212', prerequisite_id: 'cs111' }
        ] : table === 'student_terms' ? [
            { id: 't1', year_level: 1, semester: 1, status: 'unlocked', student_id: 'user1' }
        ] : [];
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    })

    render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    )

    await waitFor(() => {
        expect(screen.getByText('CS 111')).toBeInTheDocument()
    })

    // Assert that the dependent course container is rendered and acts as disabled
    const dependentCourseText = await screen.findByText('CS 212')
    const dependentContainer = dependentCourseText.closest('div.group')
    expect(dependentContainer).toBeInTheDocument()

    // Assert checkbox is disabled/absent and lock is present
    const lockIcon = dependentContainer?.querySelector('span.material-symbols-outlined')
    expect(lockIcon).toHaveTextContent('lock')

    // Simulate click
    fireEvent.click(dependentContainer!)
    
    // Assert checked state does not change (it's locked)
    const warningMessage = screen.queryByText(/Cannot select course. Missing prerequisites:/)
    expect(warningMessage).not.toBeInTheDocument()
  })

  it('TC-S1-07 — Locked Course Displays "Prerequisites not done" Badge', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'user1' } } })
    
    ;(supabase.from as any).mockImplementation((table: string) => {
        const data = table === 'courses' ? [
            { id: 'cs111', code: 'CS 111', title: 'Intro to Programming', units: 3, year_level: 1, semester: 1 },
            { id: 'cs212', code: 'CS 212', title: 'Data Structures', units: 3, year_level: 1, semester: 2 }
        ] : table === 'course_prerequisites' ? [
            { course_id: 'cs212', prerequisite_id: 'cs111' }
        ] : table === 'student_terms' ? [
            { id: 't1', year_level: 1, semester: 1, status: 'unlocked', student_id: 'user1' }
        ] : [];
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    })

    render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    )
    
    await waitFor(() => {
        expect(screen.getByText('CS 111')).toBeInTheDocument()
    })
    
    const dependentCourseText = await screen.findByText('CS 212')
    const dependentContainer = dependentCourseText.closest('div.group')
    
    const badge = await screen.findByText('Prerequisites not done')
    expect(badge).toBeInTheDocument()
    expect(dependentContainer).toContainElement(badge)
  })

  it('TC-S1-08 — Completing a Prerequisite Unlocks the Dependent Course', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'user1' } } })
    
    // We simulate that CS 111 is already passed
    ;(supabase.from as any).mockImplementation((table: string) => {
        const data = table === 'courses' ? [
            { id: 'cs111', code: 'CS 111', title: 'Intro to Programming', units: 3, year_level: 1, semester: 1 },
            { id: 'cs212', code: 'CS 212', title: 'Data Structures', units: 3, year_level: 1, semester: 2 }
        ] : table === 'course_prerequisites' ? [
            { course_id: 'cs212', prerequisite_id: 'cs111' }
        ] : table === 'student_terms' ? [
            { id: 't1', year_level: 1, semester: 1, status: 'completed', student_id: 'user1' },
            { id: 't2', year_level: 1, semester: 2, status: 'unlocked', student_id: 'user1' }
        ] : table === 'student_courses' ? [
            { id: 'sc1', course_id: 'cs111', status: 'passed', student_term_id: 't1' }
        ] : [];
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    })

    render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    )

    await waitFor(() => {
        expect(screen.getByText('CS 111')).toBeInTheDocument()
    })

    // CS 212 should now be unlocked and checkable
    const dependentCourseText = await screen.findByText('CS 212')
    const dependentContainer = dependentCourseText.closest('div.group')
    
    // The "Prerequisites not done" badge should NOT be present
    expect(screen.queryByText('Prerequisites not done')).not.toBeInTheDocument()

    // And the checkbox should be enabled (rendered instead of lock icon)
    const checkbox = dependentContainer?.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeDisabled()
  })
})
