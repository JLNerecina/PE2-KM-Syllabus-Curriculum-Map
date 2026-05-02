/**
 * Faculty Dashboard Test Suite
 * 
 * This file contains automated unit tests for the Faculty Dashboard feature.
 * It validates the visibility of assigned programs for a given faculty member,
 * drill-down navigation (Program -> Year Level -> Section), real-time student
 * search functionality, and the read-only curriculum map view specific to students.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// Assuming the component will be located at ../pages/FacultyDashboard
// If the component is not yet implemented, these tests serve as TDD specifications.
import FacultyDashboard from '../pages/FacultyDashboard'

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
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty' } })

    // Mock query logic: Returns BSCS and BSIT
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: [{ program: 'BSCS' }, { program: 'BSIT' }] })
    })

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Assert that BSCS and BSIT program cards are rendered
    await waitFor(() => {
      expect(screen.getByText('BSCS')).toBeInTheDocument()
      expect(screen.getByText('BSIT')).toBeInTheDocument()
    })

    // Assert that BSIS and BSEMC are not present
    expect(screen.queryByText('BSIS')).not.toBeInTheDocument()
    expect(screen.queryByText('BSEMC')).not.toBeInTheDocument()
  })

  it('TC-S2-07 — Tapping a Program Reveals Assigned Year Levels', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty' } })

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Click on the BSCS program card
    const bscsCard = await screen.findByText('BSCS')
    fireEvent.click(bscsCard)

    // Assert that Year 1 and Year 2 are revealed
    await waitFor(() => {
      expect(screen.getByText('Year 1')).toBeVisible()
      expect(screen.getByText('Year 2')).toBeVisible()
    })

    // Assert that Year 3 and Year 4 are not shown
    expect(screen.queryByText('Year 3')).not.toBeInTheDocument()
    expect(screen.queryByText('Year 4')).not.toBeInTheDocument()
  })

  it('TC-S2-08 — Tapping a Year Level Reveals Assigned Sections', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty' } })

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Click on BSCS, then click Year 1
    const bscsCard = await screen.findByText('BSCS')
    fireEvent.click(bscsCard)

    const year1Card = await screen.findByText('Year 1')
    fireEvent.click(year1Card)

    // Assert that sections BSCS-1A and BSCS-1B are displayed
    await waitFor(() => {
      expect(screen.getByText('BSCS-1A')).toBeVisible()
      expect(screen.getByText('BSCS-1B')).toBeVisible()
    })
  })

  it('TC-S2-09 — Search Bar Filters Students by Name', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty' } })

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Type "Juan" into the search bar
    const searchInput = await screen.findByPlaceholderText(/Search students/i)
    fireEvent.change(searchInput, { target: { value: 'Juan' } })

    // Assert that "Juan Dela Cruz" appears in the results
    await waitFor(() => {
      expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
    })

    // Assert that students not matching "Juan" are not shown
    expect(screen.queryByText('Maria Clara')).not.toBeInTheDocument()
  })

  it('TC-S2-10 — Selecting a Student Shows Their Read-Only Curriculum Map', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'faculty-123' } }, profile: { role: 'faculty' } })

    render(
      <MemoryRouter>
        <FacultyDashboard />
      </MemoryRouter>
    )

    // Search for and click on a student record
    const studentRecord = await screen.findByText('Juan Dela Cruz')
    fireEvent.click(studentRecord)

    // Assert that the student's curriculum grid is rendered in read-only mode
    const curriculumGrid = await screen.findByTestId('student-curriculum-grid')
    expect(curriculumGrid).toBeVisible()

    // Assert that no checkboxes are interactive
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled()
    })
  })
})
