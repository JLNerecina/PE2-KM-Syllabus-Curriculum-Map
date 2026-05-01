# Sprint 2 — Test Cases
**Project:** CICS Curriculum Map System
**Course:** Professional Elective 2
**Sprint Duration:** Sprint 2
**Scope:** Role-Based Dashboards (Student, Faculty, Admin), User Management, and Enrollment Flows

---

## Test Environment Setup

| Item | Detail |
|------|--------|
| Test Framework | Vitest |
| Component Testing | React Testing Library |
| E2E (if applicable) | Playwright or Cypress (recommended) |
| Mock Layer | Supabase client mocked via `vi.mock` |

---

## MODULE A — Student Dashboard

### TC-S2-01 — Student Dashboard Renders Year Level and Semester Containers

**File:** `StudentDashboard.test.tsx`
**Category:** Student View — Layout
**Priority:** High

**Preconditions:**
- Authenticated user has the `student` role.
- Mock curriculum data contains courses across Year 1–4, 2 semesters each.

**Steps:**
1. Render `<StudentDashboard />` with mocked session and curriculum data.
2. Assert that 4 year level containers are rendered (Year 1 through Year 4).
3. Assert each year level contains a 1st Semester and 2nd Semester section.

**Expected Result:** All year level and semester groupings are visible and correctly structured.

**Status:** 🔲 Not Started

---

### TC-S2-02 — Semester-Level "Select All" Checkbox Checks All Courses in That Semester

**File:** `StudentDashboard.test.tsx`
**Category:** Student View — Bulk Check
**Priority:** Medium

**Preconditions:**
- A semester has 5 courses, all with prerequisites already met.

**Steps:**
1. Render the dashboard.
2. Locate the "Select All" master checkbox for a specific semester.
3. Simulate a click on the master checkbox.
4. Assert that all 5 course checkboxes in that semester are now checked.

**Expected Result:** All eligible courses under the semester are checked simultaneously.

**Status:** 🔲 Not Started

---

### TC-S2-03 — Semester "Select All" Does Not Check Locked Courses

**File:** `StudentDashboard.test.tsx`
**Category:** Student View — Bulk Check with Locked Courses
**Priority:** High

**Preconditions:**
- A semester contains 3 unlocked courses and 2 locked courses (unmet prerequisites).

**Steps:**
1. Render the dashboard.
2. Click the "Select All" checkbox for that semester.
3. Assert that only the 3 unlocked courses are checked.
4. Assert that the 2 locked courses remain unchecked and disabled.

**Expected Result:** The master checkbox respects prerequisite locks and does not force-check locked courses.

**Status:** 🔲 Not Started

---

### TC-S2-04 — Tapping a Course Card Opens the Prerequisite Modal

**File:** `StudentDashboard.test.tsx`
**Category:** Student View — Course Detail Modal
**Priority:** High

**Preconditions:**
- A course has at least one prerequisite and unlocks at least one future course.

**Steps:**
1. Render the dashboard.
2. Simulate a click on a course card.
3. Assert that a modal or slide-over panel becomes visible.
4. Assert the modal contains a "Required Prerequisites" section listing the prerequisite course(s).
5. Assert the modal contains an "Unlocks These Courses" section listing courses that become available.

**Expected Result:** The modal renders with accurate prerequisite and unlock data for the tapped course.

**Status:** 🔲 Not Started

---

### TC-S2-05 — Course Modal Shows Correct Data for a Specific Course

**File:** `StudentDashboard.test.tsx`
**Category:** Student View — Modal Data Accuracy
**Priority:** Medium

**Preconditions:**
- `CS 212` requires `CS 111` and unlocks `CS 311`.

**Steps:**
1. Click on the `CS 212` course card.
2. Assert the modal's prerequisites list contains `CS 111`.
3. Assert the modal's unlocks list contains `CS 311`.

**Expected Result:** Course-specific prerequisite and unlock data is accurately fetched and displayed.

**Status:** 🔲 Not Started

---

## MODULE B — Faculty Dashboard

### TC-S2-06 — Faculty Dashboard Shows Only Assigned Programs

**File:** `FacultyDashboard.test.tsx`
**Category:** Faculty View — Filtered Program Display
**Priority:** High

**Preconditions:**
- Faculty member is assigned students in BSCS and BSIT but **not** BSIS or BSEMC.
- Mock enrollment data reflects this.

**Steps:**
1. Render `<FacultyDashboard />` with mocked faculty session.
2. Assert that BSCS and BSIT program cards are rendered.
3. Assert that BSIS and BSEMC are **not** present in the DOM.

**Expected Result:** Only programs with students assigned to this faculty are shown.

**Status:** 🔲 Not Started

---

### TC-S2-07 — Tapping a Program Reveals Assigned Year Levels

**File:** `FacultyDashboard.test.tsx`
**Category:** Faculty View — Drill-Down Navigation
**Priority:** Medium

**Preconditions:**
- Faculty has students in BSCS Year 1 and Year 2 only.

**Steps:**
1. Render the dashboard.
2. Click on the BSCS program card.
3. Assert that Year 1 and Year 2 are revealed.
4. Assert that Year 3 and Year 4 are **not** shown.

**Expected Result:** Year level drill-down is filtered to only show levels with enrolled students under this faculty.

**Status:** 🔲 Not Started

---

### TC-S2-08 — Tapping a Year Level Reveals Assigned Sections

**File:** `FacultyDashboard.test.tsx`
**Category:** Faculty View — Drill-Down Navigation
**Priority:** Medium

**Preconditions:**
- Faculty handles sections BSCS-1A and BSCS-1B under Year 1.

**Steps:**
1. Click on BSCS, then click Year 1.
2. Assert that sections BSCS-1A and BSCS-1B are displayed.

**Expected Result:** Section-level drill-down shows only sections assigned to the faculty.

**Status:** 🔲 Not Started

---

### TC-S2-09 — Search Bar Filters Students by Name

**File:** `FacultyDashboard.test.tsx`
**Category:** Faculty View — Student Search
**Priority:** High

**Preconditions:**
- Faculty has 10 assigned students. One student is named "Juan Dela Cruz".

**Steps:**
1. Render the dashboard.
2. Type `"Juan"` into the search bar.
3. Assert that "Juan Dela Cruz" appears in the results.
4. Assert that students not matching `"Juan"` are not shown.

**Expected Result:** Search filters the student list in real time using a case-insensitive name match.

**Status:** 🔲 Not Started

---

### TC-S2-10 — Selecting a Student Shows Their Read-Only Curriculum Map

**File:** `FacultyDashboard.test.tsx`
**Category:** Faculty View — Student Curriculum View
**Priority:** High

**Preconditions:**
- A student with known curriculum progress is in the faculty's list.

**Steps:**
1. Search for and click on a student record.
2. Assert that the student's curriculum grid is rendered in read-only mode.
3. Assert that no checkboxes are interactive (all are `disabled` or rendered as static indicators).

**Expected Result:** Faculty can view the student's curriculum progress but cannot modify it.

**Status:** 🔲 Not Started

---

## MODULE C — Admin — User Management

### TC-S2-11 — Admin User List Displays Students and Faculty Only

**File:** `AdminDashboard.test.tsx`
**Category:** Admin — User Management
**Priority:** High

**Preconditions:**
- The system has users with roles: `student`, `faculty`, `admin`, and `super_admin`.

**Steps:**
1. Render `<AdminDashboard />` in the User List tab.
2. Assert that users with roles `student` and `faculty` are listed.
3. Assert that users with roles `admin` and `super_admin` are **not** shown in this list.

**Expected Result:** Admin user list is scoped to students and faculty only.

**Status:** 🔲 Not Started

---

### TC-S2-12 — Soft Delete Sets `is_deleted = true` Without Removing the Row

**File:** `AdminDashboard.test.tsx`
**Category:** Admin — Soft Delete
**Priority:** High

**Preconditions:**
- A student user exists with `is_deleted = false`.

**Steps:**
1. Locate the student in the User List.
2. Toggle the Soft Delete button for that student.
3. Assert that the Supabase `.update()` method was called with `{ is_deleted: true }` for that user's ID.
4. Assert that the Supabase `.delete()` method was **not** called.

**Expected Result:** The user is soft-deleted (flagged) and remains recoverable in the database.

**Status:** 🔲 Not Started

---

### TC-S2-13 — Soft-Deleted Users Can Be Recovered

**File:** `AdminDashboard.test.tsx`
**Category:** Admin — User Recovery
**Priority:** Medium

**Preconditions:**
- A user exists with `is_deleted = true`.

**Steps:**
1. Navigate to the soft-deleted / inactive users view.
2. Locate the soft-deleted user.
3. Click the "Recover" or "Restore" action.
4. Assert that Supabase `.update()` is called with `{ is_deleted: false }` for that user's ID.

**Expected Result:** The user's `is_deleted` flag is set back to `false` and they regain access.

**Status:** 🔲 Not Started

---

### TC-S2-14 — Admin Can Edit Student Information

**File:** `AdminDashboard.test.tsx`
**Category:** Admin — Edit User
**Priority:** Medium

**Preconditions:**
- A student record exists with a name and institutional email.

**Steps:**
1. Click the Edit action on a student row.
2. Modify the student name field.
3. Submit the form.
4. Assert that Supabase `.update()` is called with the new name and the correct user ID.

**Expected Result:** Student information is updated in the database via a `PATCH`/`.update()` call.

**Status:** 🔲 Not Started

---

## MODULE D — Admin — Bulk Enrollment

### TC-S2-15 — Bulk Enrollment Form Renders with 5 Default Rows

**File:** `BulkEnrollment.test.tsx`
**Category:** Admin — Enrollment Form
**Priority:** Medium

**Steps:**
1. Render the Bulk Enrollment tab.
2. Assert that exactly 5 input rows are present in the enrollment table.

**Expected Result:** The form initializes with 5 rows ready for data entry.

**Status:** 🔲 Not Started

---

### TC-S2-16 — "Add Row" Button Appends a New Empty Row

**File:** `BulkEnrollment.test.tsx`
**Category:** Admin — Enrollment Form
**Priority:** Medium

**Steps:**
1. Render the Bulk Enrollment tab (5 rows visible).
2. Click the "Add Row" button.
3. Assert that the row count increases to 6.
4. Assert that the new row's input fields are empty.

**Expected Result:** A new blank row is added to the form.

**Status:** 🔲 Not Started

---

### TC-S2-17 — Confirm Enrollment Triggers Confirmation Modal Before Submitting

**File:** `BulkEnrollment.test.tsx`
**Category:** Admin — Enrollment Confirmation
**Priority:** High

**Preconditions:**
- Program, Year Level, and Section dropdowns are selected.
- At least one student row is filled in.

**Steps:**
1. Click the "Confirm Enrollment" button.
2. Assert that a confirmation modal appears before any database call is made.
3. Assert the modal asks the user to confirm the action.

**Expected Result:** A confirmation dialog intercepts the submission, preventing accidental enrollments.

**Status:** 🔲 Not Started

---

### TC-S2-18 — Confirmed Enrollment Inserts Data into Supabase

**File:** `BulkEnrollment.test.tsx`
**Category:** Admin — Enrollment Submission
**Priority:** High

**Preconditions:**
- Program: BSCS, Year Level: 1, Section: BSCS-1A.
- One student row filled: `{ student_number: "2024-00001", name: "Maria Santos", email: "maria.santos@neu.edu.ph" }`.

**Steps:**
1. Fill in the form and click "Confirm Enrollment."
2. Click the confirmation button in the modal.
3. Assert that Supabase `.insert()` (or equivalent bulk insert) is called on the `profiles` table with the student's data.
4. Assert that an enrollment record is also inserted into the `enrollments` table linking the student to BSCS / Year 1 / Section BSCS-1A.

**Expected Result:** Both the profile and enrollment records are created in the database upon confirmation.

**Status:** 🔲 Not Started

---

## MODULE E — Super Admin Constraints

### TC-S2-19 — Edit/Delete Buttons Are Disabled for Reserved Super Admin Accounts

**File:** `SuperAdminManagement.test.tsx`
**Category:** Super Admin — Protected Accounts
**Priority:** Critical

**Preconditions:**
- The admin list contains `johnlian.nerecina@neu.edu.ph` and `jcesperanza@neu.edu.ph`.

**Steps:**
1. Render the Super Admin management page with the admin list.
2. Locate the rows for both reserved emails.
3. Assert that the Edit button for each is `disabled`.
4. Assert that the Delete button for each is `disabled`.
5. Assert that a tooltip or label reading `"System reserved account"` is visible on hover or adjacent to the buttons.

**Expected Result:** Reserved system accounts cannot be edited or deleted through the UI.

**Status:** 🔲 Not Started

---

### TC-S2-20 — Non-Reserved Admin Accounts Can Be Edited and Deleted

**File:** `SuperAdminManagement.test.tsx`
**Category:** Super Admin — Normal Admin Management
**Priority:** High

**Preconditions:**
- An admin user with a non-reserved email exists (e.g., `admin@neu.edu.ph`).

**Steps:**
1. Locate the non-reserved admin row.
2. Assert that the Edit button is **enabled** and clickable.
3. Assert that the Delete button is **enabled** and clickable.

**Expected Result:** Normal admin accounts can be fully managed by the Super Admin.

**Status:** 🔲 Not Started

---

## Sprint 2 Summary

| Test Case ID | Module | Description | Priority | Status |
|---|---|---|---|---|
| TC-S2-01 | Student | Dashboard renders year/semester layout | High | 🔲 Not Started |
| TC-S2-02 | Student | Semester "Select All" checks unlocked courses | Medium | 🔲 Not Started |
| TC-S2-03 | Student | "Select All" skips locked courses | High | 🔲 Not Started |
| TC-S2-04 | Student | Course card tap opens prerequisite modal | High | 🔲 Not Started |
| TC-S2-05 | Student | Modal shows correct prerequisites and unlocks | Medium | 🔲 Not Started |
| TC-S2-06 | Faculty | Dashboard shows only assigned programs | High | 🔲 Not Started |
| TC-S2-07 | Faculty | Tapping program reveals assigned year levels | Medium | 🔲 Not Started |
| TC-S2-08 | Faculty | Tapping year level reveals assigned sections | Medium | 🔲 Not Started |
| TC-S2-09 | Faculty | Search bar filters students by name | High | 🔲 Not Started |
| TC-S2-10 | Faculty | Selecting student shows read-only curriculum | High | 🔲 Not Started |
| TC-S2-11 | Admin | User list shows students and faculty only | High | 🔲 Not Started |
| TC-S2-12 | Admin | Soft delete sets `is_deleted = true` | High | 🔲 Not Started |
| TC-S2-13 | Admin | Soft-deleted users can be recovered | Medium | 🔲 Not Started |
| TC-S2-14 | Admin | Admin can edit student information | Medium | 🔲 Not Started |
| TC-S2-15 | Admin | Bulk enrollment form has 5 default rows | Medium | 🔲 Not Started |
| TC-S2-16 | Admin | "Add Row" appends a new empty row | Medium | 🔲 Not Started |
| TC-S2-17 | Admin | Confirm enrollment shows modal first | High | 🔲 Not Started |
| TC-S2-18 | Admin | Confirmed enrollment inserts into Supabase | High | 🔲 Not Started |
| TC-S2-19 | Super Admin | Reserved accounts have disabled edit/delete | Critical | 🔲 Not Started |
| TC-S2-20 | Super Admin | Non-reserved admins can be managed | High | 🔲 Not Started |

**Total:** 20 test cases | **Not Started:** 20 | **In Progress:** 0 | **Pass:** 0 | **Fail:** 0
