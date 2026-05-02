/**
 * Student Dashboard Test Suite
 * 
 * This file contains automated unit tests for the Student Dashboard feature.
 * It validates the structural layout of the dashboard (year levels and semesters),
 * bulk actions like "Select All" for semesters (including adherence to prerequisite locks),
 * and the course detail modal displaying prerequisite and unlock information.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// The feature corresponds to the Tracker page in the current implementation.
import StudentDashboard from '../pages/Tracker'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('Student View — Dashboard & Modals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-S2-01 — Student Dashboard Renders Year Level and Semester Containers', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        const builder: any = Promise.resolve({ data: [] });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Assert that year level buttons are rendered
    await waitFor(() => {
      expect(screen.getByText('1st Year')).toBeInTheDocument()
      expect(screen.getByText('2nd Year')).toBeInTheDocument()
      expect(screen.getByText('3rd Year')).toBeInTheDocument()
      expect(screen.getByText('4th Year')).toBeInTheDocument()
    })

    // Assert semester buttons
    expect(screen.getByText('1st Semester')).toBeInTheDocument()
    expect(screen.getByText('2nd Semester')).toBeInTheDocument()
  })

  it('TC-S2-02 — Semester-Level "Select All" Checkbox Checks All Courses in That Semester', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'courses') {
            data = [
                { id: 'c1', code: 'CS 111', title: 'A', units: 3, year_level: 1, semester: 1 },
                { id: 'c2', code: 'CS 112', title: 'B', units: 3, year_level: 1, semester: 1 }
            ];
        } else if (table === 'student_terms') {
            data = [{ id: 'term1', year_level: 1, semester: 1, status: 'unlocked', student_id: 'student-123' }];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Locate the "Select All" button
    const selectAllBtn = await screen.findByText('Select All')
    fireEvent.click(selectAllBtn)

    // Checkboxes should be checked (in our UI, selected courses have a checkbox checked)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('TC-S2-03 — Semester "Select All" Does Not Check Locked Courses', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'courses') {
            data = [
                { id: 'c1', code: 'CS 111', title: 'A', units: 3, year_level: 1, semester: 1 },
                { id: 'c2', code: 'CS 112', title: 'B', units: 3, year_level: 1, semester: 1 } // c2 requires c3 which is not taken
            ];
        } else if (table === 'course_prerequisites') {
            data = [{ course_id: 'c2', prerequisite_id: 'c3' }];
        } else if (table === 'student_terms') {
            data = [{ id: 'term1', year_level: 1, semester: 1, status: 'unlocked', student_id: 'student-123' }];
        }
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    const selectAllBtn = await screen.findByText('Select All')
    fireEvent.click(selectAllBtn)

    // CS 111 should be checked
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()

    // CS 112 should be locked (no checkbox, instead it has a lock icon)
    const lockedCourseText = screen.getByText('CS 112')
    const container = lockedCourseText.closest('div.group')
    expect(container?.querySelector('span.material-symbols-outlined')).toHaveTextContent('lock')
  })

  it('TC-S2-04 — Tapping a Course Card Opens the Prerequisite Modal', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'courses') {
            data = [{ id: 'c1', code: 'CS 212', title: 'Data Structures', units: 3, year_level: 1, semester: 1 }];
        }
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Simulate a click on the "Info" button of a course card
    const infoButton = await screen.findByText('Info')
    fireEvent.click(infoButton)

    // Assert that a modal becomes visible
    const modalTitle = await screen.findByText('COURSE DETAILS')
    expect(modalTitle).toBeVisible()

    // Assert the modal contains prerequisite and unlock sections
    expect(screen.getByText('Prerequisites')).toBeInTheDocument()
    expect(screen.getByText('Required For')).toBeInTheDocument()
  })

  it('TC-S2-05 — Course Modal Shows Correct Data for a Specific Course', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'courses') {
            data = [
                { id: 'c1', code: 'CS 111', title: 'Intro', units: 3, year_level: 1, semester: 1 },
                { id: 'c2', code: 'CS 212', title: 'Data Structures', units: 3, year_level: 1, semester: 2 },
                { id: 'c3', code: 'CS 311', title: 'Algorithms', units: 3, year_level: 2, semester: 1 }
            ];
        } else if (table === 'course_prerequisites') {
            data = [
                { course_id: 'c2', prerequisite_id: 'c1' },
                { course_id: 'c3', prerequisite_id: 'c2' }
            ];
        }
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        return builder;
    });

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Wait for the UI to load and click on CS 212 Info button
    await waitFor(() => expect(screen.getByText('CS 212')).toBeInTheDocument())
    
    // Find the Info button specifically for CS 212
    const cs212Container = screen.getByText('CS 212').closest('div.group')
    const infoButton = cs212Container!.querySelector('button') // The Info button
    fireEvent.click(infoButton!)

    // Assert the modal's prerequisites list contains CS 111
    const prereqHeader = await screen.findByText('Prerequisites')
    const prereqContainer = prereqHeader.parentElement
    expect(prereqContainer).toHaveTextContent('CS 111')

    // Assert the modal's required for (unlocks) list contains CS 311
    const unlocksHeader = screen.getByText('Required For')
    const unlocksContainer = unlocksHeader.parentElement
    expect(unlocksContainer).toHaveTextContent('CS 311')
  })
})
