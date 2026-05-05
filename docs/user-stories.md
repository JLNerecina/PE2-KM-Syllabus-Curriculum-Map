# User Stories
**Project:** CICS Curriculum Map System
**Development Approach:** AI-assisted coding using Google AI Studio (Gemini). Developer prompts, reviews, refines, and owns all generated code.
**Date:** 2026-05-01
**Total Points:** 65

---

### Full Product Backlog

| ID    | User Story                                                                                                                                 | Story Points | Priority |
|-------|--------------------------------------------------------------------------------------------------------------------------------------------|--------------|----------|
| US-01 | As a **Super Admin**, I want to manage Admin accounts so that I can control who has elevated system access                                 | 3            | High     |
| US-02 | As a **Super Admin**, I want to pre-assign roles to specific email accounts so that Admins and Faculty can instantly access the system     | 3            | High     |
| US-03 | As an **Admin**, I want to manage Faculty and Student accounts so that user enrollment and data are properly maintained                    | 5            | High     |
| US-04 | As an **Admin**, I want to bulk enroll students and faculty into programs, year levels, and sections so that access is granted efficiently | 8            | High     |
| US-05 | As a **Student**, I want to log in using my NEU Google account so that only authorized users can access the system                        | 3            | High     |
| US-06 | As a **Student**, I want a personal dashboard showing my program's curriculum map so that I can view my courses per year and semester      | 5            | High     |
| US-07 | As a **Student**, I want to check off courses I have already completed so that I can track my academic progress                           | 5            | High     |
| US-08 | As a **Student**, I want the system to block me from checking a course if its prerequisites are unmet so that course flow is enforced     | 8            | High     |
| US-09 | As a **Student**, I want to tap a course to see its required prerequisites and the courses it unlocks so that I understand my learning path| 5            | High     |
| US-10 | As a **Student**, I want a master checkbox per semester so that I can quickly mark all eligible courses in one tap                        | 3            | Medium   |
| US-11 | As a **Faculty**, I want to view a dashboard filtered to only my assigned programs, year levels, and sections so that I see only relevant data | 5         | High     |
| US-12 | As a **Faculty**, I want to search for students by name or ID so that I can quickly locate a specific learner                            | 3            | High     |
| US-13 | As a **Faculty**, I want to view a read-only version of a student's curriculum map so that I can monitor their progress                   | 5            | High     |
| US-14 | As any **authenticated user**, I want to receive a clear error message if my account is not enrolled in the system so that I understand why access is denied | 3 | High |

**Total Story Points:** 64

---

## Sprint 1
Developer builds core features. Each member works on their deliverables in parallel on their own branch.

**Stories for Sprint 1 — Total: 27 points**

| ID    | User Story                                                                 | Story Points | Assignee   |
|-------|----------------------------------------------------------------------------|--------------|------------|
| US-05 | Student – Google OAuth login with NEU domain restriction                   | 3            | Dev        |
| US-14 | Error message for unenrolled or unauthorized accounts                      | 3            | Dev        |
| US-01 | Super Admin – manage Admin accounts                                        | 3            | Dev        |
| US-02 | Super Admin – pre-assign roles to email accounts                           | 3            | Dev        |
| US-03 | Admin – manage Faculty and Student accounts (add, edit, soft delete)       | 5            | Dev        |
| US-06 | Student – personal dashboard showing curriculum by year and semester       | 5            | Dev        |
| US-08 | Student – prerequisite enforcement (block checking if prereqs unmet)       | 5            | Dev        |

**Focus:** Authentication, role-based access control, admin user management, and core prerequisite enforcement.

### Sprint 1 — Test Cases

| TC ID     | Linked US | Description                                                                 | Test File                  | Status     |
|-----------|-----------|-----------------------------------------------------------------------------|----------------------------|------------|
| TC-S1-01  | US-05     | Google OAuth button renders and initiates the sign-in flow                  | `Login.test.tsx`           | ✅ Pass     |
| TC-S1-02  | US-05     | Login blocks emails not ending in `@neu.edu.ph` or `@student.neu.edu`       | `Login.test.tsx`           | ✅ Pass     |
| TC-S1-03  | US-14     | Login blocks valid NEU emails that are not enrolled in the system           | `Login.test.tsx`           | ✅ Pass     |
| TC-S1-04  | US-06     | Curriculum map displays only the authenticated student's enrolled courses   | `Map.test.tsx`             | ✅ Pass     |
| TC-S1-05  | US-06     | Curriculum map correctly groups courses by year level and semester          | `Map.test.tsx`             | ✅ Pass     |
| TC-S1-06  | US-08     | A course checkbox is disabled when its prerequisite has not been completed  | `Tracker.test.tsx`         | ✅ Pass     |
| TC-S1-07  | US-08     | A locked course displays the "Prerequisites not done" badge                 | `Tracker.test.tsx`         | ✅ Pass     |
| TC-S1-08  | US-08     | Completing a prerequisite course unlocks and enables the dependent course   | `Tracker.test.tsx`         | ✅ Pass     |

**Sprint 1 Result:** 8 / 8 test cases passing ✅

---

## Sprint 2
Features integrated into the `dev` branch. QA Lead begins testing. Bug reports filed as GitHub Issues.

**Stories for Sprint 2 — Total: 26 points**

| ID    | User Story                                                                 | Story Points | Assignee   |
|-------|----------------------------------------------------------------------------|--------------|------------|
| US-04 | Admin – bulk enroll students and faculty into programs/sections            | 8            | Dev        |
| US-07 | Student – check off completed courses and persist progress                 | 5            | Dev        |
| US-09 | Student – tap a course to see prerequisites and unlockable courses (modal) | 5            | Dev        |
| US-10 | Student – master semester checkbox to mark all eligible courses            | 3            | Dev        |
| US-11 | Faculty – dashboard filtered to assigned programs, year levels, sections   | 5            | Dev        |

**Focus:** Bulk enrollment flow, student progress tracking, course detail modal, and faculty filtered dashboard.

### Sprint 2 — Test Cases

#### Module A — Student Dashboard & Progress Tracking

| TC ID     | Linked US | Description                                                                 | Test File                        | Status          |
|-----------|-----------|-----------------------------------------------------------------------------|----------------------------------|-----------------|
| TC-S2-01  | US-06     | Dashboard renders all year level and semester containers correctly          | `StudentDashboard.test.tsx`      |  ✅ Pass        |
| TC-S2-02  | US-10     | Semester "Select All" checkbox checks all unlocked courses in that semester | `StudentDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-03  | US-10     | Semester "Select All" does not check locked (prerequisite-blocked) courses  | `StudentDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-04  | US-09     | Tapping a course card opens the prerequisite detail modal                   | `StudentDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-05  | US-09     | Modal displays correct prerequisites and unlockable courses for a course    | `StudentDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-06  | US-07     | Checking a completed course persists the update to Supabase                 | `Tracker.test.tsx`               | ✅ Pass         |

#### Module B — Faculty Dashboard

| TC ID     | Linked US | Description                                                                 | Test File                        | Status          |
|-----------|-----------|-----------------------------------------------------------------------------|----------------------------------|-----------------|
| TC-S2-07  | US-11     | Faculty dashboard shows only programs with assigned students                | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-08  | US-11     | Tapping a program reveals only assigned year levels                         | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-09  | US-11     | Tapping a year level reveals only assigned sections                         | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-10  | US-12     | Search bar filters assigned students by name (case-insensitive)             | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-11  | US-12     | Search bar filters assigned students by student ID                          | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-12  | US-13     | Selecting a student renders their curriculum map in read-only mode          | `FacultyDashboard.test.tsx`      | ✅ Pass         |
| TC-S2-13  | US-13     | Read-only curriculum map has no interactive or editable checkboxes          | `FacultyDashboard.test.tsx`      | ✅ Pass         |

#### Module C — Admin Bulk Enrollment

| TC ID     | Linked US | Description                                                                 | Test File                        | Status          |
|-----------|-----------|-----------------------------------------------------------------------------|----------------------------------|-----------------|
| TC-S2-14  | US-04     | Bulk enrollment form renders with 5 default input rows                      | `BulkEnrollment.test.tsx`        | ✅ Pass         |
| TC-S2-15  | US-04     | "Add Row" button appends a new empty row to the form                        | `BulkEnrollment.test.tsx`        | ✅ Pass         |
| TC-S2-16  | US-04     | Clicking "Confirm Enrollment" shows a confirmation modal before submitting  | `BulkEnrollment.test.tsx`        | ✅ Pass         |
| TC-S2-17  | US-04     | Confirmed enrollment inserts profile and enrollment records into Supabase   | `BulkEnrollment.test.tsx`        | ✅ Pass         |
| TC-S2-18  | US-03     | Soft delete sets `is_deleted = true` without calling Supabase `.delete()`   | `AdminDashboard.test.tsx`        | ✅ Pass         |
| TC-S2-19  | US-03     | A soft-deleted user can be recovered by setting `is_deleted = false`        | `AdminDashboard.test.tsx`        | ✅ Pass         |

#### Module D — Super Admin Constraints

| TC ID     | Linked US | Description                                                                 | Test File                        | Status          |
|-----------|-----------|-----------------------------------------------------------------------------|----------------------------------|-----------------|
| TC-S2-20  | US-01     | Edit and Delete buttons are disabled for reserved Super Admin accounts      | `SuperAdminManagement.test.tsx`  | ✅ Pass         |
| TC-S2-21  | US-01     | Reserved accounts display "System reserved account" tooltip on hover        | `SuperAdminManagement.test.tsx`  | ✅ Pass         |
| TC-S2-22  | US-01     | Non-reserved Admin accounts can be edited and deleted by Super Admin        | `SuperAdminManagement.test.tsx`  | ✅ Pass         |

**Sprint 2 Total Test Cases:** 22 | **Not Started:** 22 | **Pass:** 0 | **Fail:** 0

---

## Remaining Backlog (Future Sprints / Polish Phase)

| ID    | User Story                                                                                                     | Story Points | Priority |
|-------|----------------------------------------------------------------------------------------------------------------|--------------|----------|
| US-12 | Faculty – search for students by name or ID                                                                    | 3            | High     |
| US-13 | Faculty – view read-only student curriculum map                                                                | 5            | High     |

> **Note:** US-12 and US-13 may be pulled into Sprint 2 scope depending on team velocity after Sprint 1 retrospective.

---

## Team Velocity

| Sprint   | Planned Points | Completed Points | Velocity |
|----------|---------------|-----------------|----------|
| Sprint 1 | 27            | 27              | 27       |
| Sprint 2 | 26            | —               | TBD      |

**Velocity Target:** 20–27 points per sprint (to be finalized after Sprint 1 retrospective).
