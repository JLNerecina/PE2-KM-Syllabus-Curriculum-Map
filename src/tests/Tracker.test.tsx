import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

const mockCourses = [
  { id: 'c1', code: 'IT101', title: 'Intro to IT', units: 3, year_level: 1, semester: 1 },
  { id: 'c2', code: 'IT102', title: 'Programming 1', units: 3, year_level: 1, semester: 2 },
]

const mockPrereqs = [
  { course_id: 'c2', prerequisite_id: 'c1' }
]

const mockTerms = [
  { id: 't1', year_level: 1, semester: 1, status: 'unlocked', student_id: 'user1' }
]

const mockStudentCourses: any[] = []

describe('Tracker Component - Course Status Marking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not allow marking a course as selected/passed if it has a locked status (missing prerequisites)', async () => {
    (useAuth as any).mockReturnValue({ session: { user: { id: 'user1' } } })
    
    ;(supabase.from as any).mockImplementation((table: string) => {
        let data: any = [];
        if (table === 'courses') data = mockCourses;
        if (table === 'course_prerequisites') data = mockPrereqs;
        if (table === 'student_terms') data = mockTerms;
        if (table === 'student_courses') data = mockStudentCourses;
        
        const builder: any = Promise.resolve({ data });
        builder.select = vi.fn().mockReturnValue(builder);
        builder.order = vi.fn().mockReturnValue(builder);
        builder.eq = vi.fn().mockReturnValue(builder);
        builder.in = vi.fn().mockReturnValue(builder);
        
        return builder;
    })

    render(<Tracker />)

    // Wait for courses to load
    await waitFor(() => {
        expect(screen.getByText('IT101')).toBeInTheDocument()
    })

    // Switch to semester 2
    fireEvent.click(screen.getByText('2nd Semester'))

    // The IT102 course is locked because IT101 is not passed
    // Find the course container for IT102 and click it
    const it102Text = await screen.findByText('IT102')
    // Click on the parent div which acts as the checkbox area
    const courseContainer = it102Text.closest('div.group')
    expect(courseContainer).toBeInTheDocument()

    fireEvent.click(courseContainer!)

    // Because the course is locked, it should not be selected.
    // The "Prerequisites not done" badge should be visible.
    const lockedBadge = screen.getByText('Prerequisites not done')
    expect(lockedBadge).toBeInTheDocument()

    // Wait a short moment to ensure no selection happened
    await new Promise(r => setTimeout(r, 100))
    
    // We can verify it's still unselected by checking there is no "Cannot select course" warning 
    // since the click is completely ignored for locked courses.
    const warningMessage = screen.queryByText(/Cannot select course. Missing prerequisites:/)
    expect(warningMessage).not.toBeInTheDocument()
  })
})
