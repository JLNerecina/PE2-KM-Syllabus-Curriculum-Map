import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

vi.mock('html2pdf.js', () => ({
    default: () => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn()
    })
}))

describe('Curriculum Map', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-S1-04 — Curriculum Map Displays Only the Enrolled Student\'s Courses', async () => {
    const mockUserIdA = 'StudentA_123';
    (useAuth as any).mockReturnValue({ session: { user: { id: mockUserIdA } } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'student_terms') {
            data = [{ id: 'termA1', year_level: 1, semester: 1 }];
        } else if (table === 'student_courses') {
            data = [{ course_id: 'cA1', student_term_id: 'termA1', status: 'passed' }];
        } else if (table === 'courses') {
            data = [{ id: 'cA1', code: 'CS 101', title: 'Intro A', units: 3 }];
        }

        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockImplementation((col: string, val: any) => {
            if (table === 'student_terms' && col === 'student_id') {
                expect(val).toBe(mockUserIdA);
            }
            return builder;
        });
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    })

    render(
      <MemoryRouter>
        <Map />
      </MemoryRouter>
    )

    await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('student_terms')
    })
    
    // Assert Student A's courses are displayed
    await waitFor(() => {
        expect(screen.getByText('CS 101')).toBeInTheDocument()
    })
    
    // Assert Student B's courses are not present
    expect(screen.queryByText('CS 102 (Student B)')).not.toBeInTheDocument()
  })

  it('TC-S1-05 — Curriculum Map Shows Correct Year Level and Semester Groupings', async () => {
    const mockUserId = 'StudentA_123';
    (useAuth as any).mockReturnValue({ session: { user: { id: mockUserId } } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'student_terms') {
            data = [
                { id: 'term1', year_level: 1, semester: 1 },
                { id: 'term2', year_level: 1, semester: 2 },
                { id: 'term3', year_level: 2, semester: 1 }
            ];
        } else if (table === 'student_courses') {
            data = [
                { course_id: 'c1', student_term_id: 'term1', status: 'passed' },
                { course_id: 'c2', student_term_id: 'term2', status: 'passed' },
                { course_id: 'c3', student_term_id: 'term3', status: 'passed' }
            ];
        } else if (table === 'courses') {
            data = [
                { id: 'c1', code: 'CS 111', title: 'Intro', year_level: 1, semester: 1, units: 3 },
                { id: 'c2', code: 'CS 112', title: 'Prog 1', year_level: 1, semester: 2, units: 3 },
                { id: 'c3', code: 'CS 211', title: 'Prog 2', year_level: 2, semester: 1, units: 3 }
            ];
        }

        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    })

    render(
      <MemoryRouter>
        <Map />
      </MemoryRouter>
    )

    await waitFor(() => {
        // Assert year level containers
        expect(screen.getByText('Year 1')).toBeInTheDocument()
        expect(screen.getByText('Year 2')).toBeInTheDocument()
    })

    // Assert semester sections within those years
    const sem1Headers = screen.getAllByText('Sem 1')
    expect(sem1Headers.length).toBeGreaterThanOrEqual(2)
    
    const sem2Headers = screen.getAllByText('Sem 2')
    expect(sem2Headers.length).toBeGreaterThanOrEqual(1)

    // Assert course cards appear
    expect(screen.getByText('CS 111')).toBeInTheDocument()
    expect(screen.getByText('CS 112')).toBeInTheDocument()
    expect(screen.getByText('CS 211')).toBeInTheDocument()
  })
})
