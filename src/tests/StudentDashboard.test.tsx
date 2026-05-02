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

// Assuming the component will be located at ../pages/StudentDashboard
// If the component is not yet implemented, these tests serve as TDD specifications.
import StudentDashboard from '../pages/StudentDashboard'

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

    // Mock implementation for the curriculum data if necessary
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: [] })
    })

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Assert that 4 year level containers are rendered
    await waitFor(() => {
      expect(screen.getByText('Year 1')).toBeInTheDocument()
      expect(screen.getByText('Year 2')).toBeInTheDocument()
      expect(screen.getByText('Year 3')).toBeInTheDocument()
      expect(screen.getByText('Year 4')).toBeInTheDocument()
    })

    // Assert each year level contains a 1st Semester and 2nd Semester section
    const firstSemesters = screen.getAllByText(/1st Semester/i)
    const secondSemesters = screen.getAllByText(/2nd Semester/i)
    
    expect(firstSemesters.length).toBeGreaterThanOrEqual(4)
    expect(secondSemesters.length).toBeGreaterThanOrEqual(4)
  })

  it('TC-S2-02 — Semester-Level "Select All" Checkbox Checks All Courses in That Semester', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Locate the "Select All" master checkbox for a specific semester
    // Using a test ID or distinct label for the target semester's select all button
    const selectAllCheckbox = await screen.findByTestId('select-all-year1-sem1')
    fireEvent.click(selectAllCheckbox)

    // Assert that all 5 course checkboxes in that semester are now checked
    // Assume courses in this semester have test ids like 'course-checkbox-X'
    const courseCheckboxes = screen.getAllByTestId(/course-checkbox-year1-sem1/)
    expect(courseCheckboxes.length).toBe(5)
    
    courseCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('TC-S2-03 — Semester "Select All" Does Not Check Locked Courses', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    const selectAllCheckbox = await screen.findByTestId('select-all-year1-sem2')
    fireEvent.click(selectAllCheckbox)

    // Assert that only the 3 unlocked courses are checked
    const unlockedCheckboxes = screen.getAllByTestId('course-checkbox-unlocked')
    expect(unlockedCheckboxes.length).toBe(3)
    unlockedCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })

    // Assert that the 2 locked courses remain unchecked and disabled
    const lockedCheckboxes = screen.getAllByTestId('course-checkbox-locked')
    expect(lockedCheckboxes.length).toBe(2)
    lockedCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked()
      expect(checkbox).toBeDisabled()
    })
  })

  it('TC-S2-04 — Tapping a Course Card Opens the Prerequisite Modal', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Simulate a click on a course card
    const courseCard = await screen.findByTestId('course-card-CS212')
    fireEvent.click(courseCard)

    // Assert that a modal becomes visible
    const modal = await screen.findByRole('dialog')
    expect(modal).toBeVisible()

    // Assert the modal contains prerequisite and unlock sections
    expect(screen.getByText('Required Prerequisites')).toBeInTheDocument()
    expect(screen.getByText('Unlocks These Courses')).toBeInTheDocument()
  })

  it('TC-S2-05 — Course Modal Shows Correct Data for a Specific Course', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'student-123' } }, profile: { role: 'student' } })

    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    )

    // Click on the CS 212 course card
    const courseCard = await screen.findByTestId('course-card-CS212')
    fireEvent.click(courseCard)

    // Assert the modal's prerequisites list contains CS 111
    const prereqSection = await screen.findByTestId('modal-prerequisites-list')
    expect(prereqSection).toHaveTextContent('CS 111')

    // Assert the modal's unlocks list contains CS 311
    const unlocksSection = await screen.findByTestId('modal-unlocks-list')
    expect(unlocksSection).toHaveTextContent('CS 311')
  })
})
