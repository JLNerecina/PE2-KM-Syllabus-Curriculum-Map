/**
 * Faculty Dashboard Test Suite
 * 
 * This file contains automated unit tests for the Faculty Dashboard feature.
 * It validates the visibility of assigned programs for a given faculty member,
 * real-time student search functionality, and the read-only curriculum map view.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// The feature corresponds to the Monitor page in the current implementation.
import FacultyDashboard from '../pages/Monitor'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('Faculty View — Dashboard Navigation & Search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-S2-06 — Faculty Dashboard Shows Only Assigned Programs', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty', id: 'faculty-123' } })

    // Mock query logic: Returns BSCS and BSIT
    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'faculty_overseen_programs') {
            data = [{ programs: { id: 'p1', code: 'BSCS', name: 'Computer Science' } }, { programs: { id: 'p2', code: 'BSIT', name: 'Information Tech' } }];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Assert that BSCS and BSIT program dropdown options are rendered
    await waitFor(() => {
      expect(screen.getByText('BSCS - Computer Science')).toBeInTheDocument()
      expect(screen.getByText('BSIT - Information Tech')).toBeInTheDocument()
    })

    // Assert that BSIS and BSEMC are not present
    expect(screen.queryByText('BSIS')).not.toBeInTheDocument()
    expect(screen.queryByText('BSEMC')).not.toBeInTheDocument()
  })

  it('TC-S2-07 — Tapping a Program Reveals Enrolled Students (Revised from Year Levels)', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty', id: 'faculty-123' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'faculty_overseen_programs') {
            data = [{ programs: { id: 'p1', code: 'BSCS', name: 'Computer Science' } }];
        } else if (table === 'profiles') {
            data = [
                { id: 's1', name: 'Juan Dela Cruz', role: 'student', program_id: 'p1' },
                { id: 's2', name: 'Maria Clara', role: 'student', program_id: 'p1' }
            ];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Wait for students to load in the sidebar
    await waitFor(() => {
      expect(screen.getByText('Juan Dela Cruz')).toBeVisible()
      expect(screen.getByText('Maria Clara')).toBeVisible()
    })
  })

  it('TC-S2-08 — Tapping a Student Reveals Their Profile Stats (Revised from Sections)', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty', id: 'faculty-123' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'faculty_overseen_programs') {
            data = [{ programs: { id: 'p1', code: 'BSCS', name: 'Computer Science' } }];
        } else if (table === 'profiles') {
            data = [{ id: 's1', name: 'Juan Dela Cruz', role: 'student', program_id: 'p1', id_number: '2023-0001' }];
        } else if (table === 'courses') {
            data = [];
        } else if (table === 'student_terms') {
            data = [];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Click on Juan Dela Cruz
    const studentBtn = await screen.findByText('Juan Dela Cruz')
    fireEvent.click(studentBtn)

    // Assert that the student details card appears
    await waitFor(() => {
      expect(screen.getAllByText(/2023-0001/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Units Passed/i)[0]).toBeInTheDocument()
    })
  })

  it('TC-S2-09 — Search Bar Filters Students by Name', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty', id: 'faculty-123' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'faculty_overseen_programs') {
            data = [{ programs: { id: 'p1', code: 'BSCS', name: 'Computer Science' } }];
        } else if (table === 'profiles') {
            data = [
                { id: 's1', name: 'Juan Dela Cruz', role: 'student', program_id: 'p1' },
                { id: 's2', name: 'Maria Clara', role: 'student', program_id: 'p1' }
            ];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Type "Juan" into the search bar
    const searchInput = await screen.findByPlaceholderText(/Search by name or ID/i)
    fireEvent.change(searchInput, { target: { value: 'Juan' } })

    // Assert that "Juan Dela Cruz" appears in the results
    await waitFor(() => {
      expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
    })

    // Assert that students not matching "Juan" are not shown
    expect(screen.queryByText('Maria Clara')).not.toBeInTheDocument()
  })

  it('TC-S2-10 — Selecting a Student Shows Link to Curriculum Map', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty', id: 'faculty-123' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'faculty_overseen_programs') {
            data = [{ programs: { id: 'p1', code: 'BSCS', name: 'Computer Science' } }];
        } else if (table === 'profiles') {
            data = [{ id: 's1', name: 'Juan Dela Cruz', role: 'student', program_id: 'p1' }];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Search for and click on a student record
    const studentRecord = await screen.findByText('Juan Dela Cruz')
    fireEvent.click(studentRecord)

    // Assert that the Curriculum Map button is available
    const mapBtn = await screen.findByText('Curriculum Map')
    expect(mapBtn).toBeVisible()
    
    // (Optional) We could verify it opens in read-only mode by mocking window.open
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    fireEvent.click(mapBtn)
    expect(windowOpenSpy).toHaveBeenCalledWith('/map/s1', '_blank')
  })
})
