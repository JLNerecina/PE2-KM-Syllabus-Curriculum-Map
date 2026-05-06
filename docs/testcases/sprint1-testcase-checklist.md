# Sprint 1 — Test Cases
**Project:** CICS Curriculum Map System
**Course:** Professional Elective 2
**Sprint Duration:** Sprint 1
**Scope:** Authentication, Curriculum Map Visibility, and Prerequisite Tracker UI

---

## Test Environment Setup

| Item | Detail |
|------|--------|
| Test Framework | Vitest |
| Component Testing | React Testing Library |
| Config File | `vitest.config.ts` |
| Setup File | `setup.ts` |
| Test Script | `npm run test` (defined in `package.json`) |

---

## TC-S1-01 — Google OAuth Button Renders and Initiates Flow

**File:** `Login.test.tsx`
**Category:** Authentication
**Priority:** High

**Preconditions:**
- The login page is rendered.
- Supabase Google OAuth provider is mocked.

**Steps:**
1. Render the `<Login />` component.
2. Assert that the "Sign in with Google" button is visible in the DOM.
3. Simulate a click event on the button.
4. Assert that the Supabase `signInWithOAuth` method was called with the `google` provider.

**Expected Result:** The `signInWithOAuth` function is invoked exactly once with `{ provider: 'google' }`.

**Status:** ✅ Pass

---

## TC-S1-02 — Login Blocks Non-NEU Domain Emails

**File:** `Login.test.tsx`
**Category:** Authentication — Domain Restriction
**Priority:** High

**Preconditions:**
- A user successfully authenticates via Google OAuth but the returned session email does not end in `@student.neu.edu` (or `@neu.edu.ph`).
- The auth callback handler is active.

**Steps:**
1. Mock a successful OAuth return with a non-NEU email (e.g., `user@gmail.com`).
2. Trigger the auth state change listener.
3. Assert that `supabase.auth.signOut()` is called immediately.
4. Assert that the error state is set to `"You are not yet enrolled in any program."`.
5. Assert that the error message is rendered in the DOM (error toast/modal).

**Expected Result:** User is signed out and the "You are not yet enrolled in any program." message is displayed.

**Status:** ✅ Pass

---

## TC-S1-03 — Login Blocks Emails Not Present in the Profiles Table

**File:** `Login.test.tsx`
**Category:** Authentication — Database Enrollment Check
**Priority:** High

**Preconditions:**
- A user successfully authenticates with a valid `@neu.edu.ph` email.
- The email does **not** exist in the `profiles` table (mocked Supabase response returns empty/null).

**Steps:**
1. Mock a successful OAuth return with a valid NEU domain email (e.g., `student@neu.edu.ph`).
2. Mock the `profiles` table query to return no matching record.
3. Trigger the auth callback.
4. Assert that `supabase.auth.signOut()` is called.
5. Assert that the error message `"You are not yet enrolled in any program."` is displayed.

**Expected Result:** User is signed out despite valid domain email because they are not enrolled in the system.

**Status:** ✅ Pass

---

## TC-S1-04 — Curriculum Map Displays Only the Enrolled Student's Courses

**File:** `Map.test.tsx`
**Category:** Curriculum Map — Data Isolation
**Priority:** High

**Preconditions:**
- Two student records exist in the mock database with different `student_id` values and different enrolled programs.
- The currently authenticated user is Student A.

**Steps:**
1. Render the `<CurriculumMap />` component with Student A's session context.
2. Assert that courses associated with Student A's `student_id` are rendered.
3. Assert that courses belonging to Student B's `student_id` are **not** present in the DOM.

**Expected Result:** The map strictly shows only curriculum data tied to the authenticated student's `student_id`.

**Status:** ✅ Pass

---

## TC-S1-05 — Curriculum Map Shows Correct Year Level and Semester Groupings

**File:** `Map.test.tsx`
**Category:** Curriculum Map — Structure Visibility
**Priority:** Medium

**Preconditions:**
- The authenticated student is enrolled in a program with courses spanning multiple year levels and semesters.

**Steps:**
1. Render the `<CurriculumMap />` component.
2. Assert that year level containers (Year 1, Year 2, etc.) are rendered.
3. Assert that each year level contains two semester sections (1st Semester, 2nd Semester).
4. Assert that course cards appear under their correct semester grouping based on mock data.

**Expected Result:** Courses are accurately grouped and displayed under their respective year level and semester containers.

**Status:** ✅ Pass

---

## TC-S1-06 — Locked Course Checkbox Is Disabled When Prerequisite Is Incomplete

**File:** `Tracker.test.tsx`
**Category:** Prerequisite Tracker — Lock State
**Priority:** High

**Preconditions:**
- A course (e.g., `CS 212 - Data Structures`) has a prerequisite (e.g., `CS 111 - Intro to Programming`).
- The student has **not** checked off the prerequisite course.

**Steps:**
1. Render the `<Tracker />` component with the student's progress state where `CS 111` is incomplete.
2. Locate the checkbox for `CS 212`.
3. Assert that the checkbox is `disabled`.
4. Simulate a click on the disabled checkbox.
5. Assert that the checked state of `CS 212` does **not** change.

**Expected Result:** The checkbox for the dependent course remains disabled and cannot be toggled.

**Status:** ✅ Pass

---

## TC-S1-07 — Locked Course Displays "Prerequisites not done" Badge

**File:** `Tracker.test.tsx`
**Category:** Prerequisite Tracker — Visual Indicator
**Priority:** Medium

**Preconditions:**
- A course has an unmet prerequisite (same setup as TC-S1-06).

**Steps:**
1. Render the `<Tracker />` component with the prerequisite incomplete.
2. Locate the course card for `CS 212`.
3. Assert that a badge or label with the text `"Prerequisites not done"` is present in the DOM.

**Expected Result:** The "Prerequisites not done" badge is visible on the locked course card.

**Status:** ✅ Pass

---

## TC-S1-08 — Completing a Prerequisite Unlocks the Dependent Course

**File:** `Tracker.test.tsx`
**Category:** Prerequisite Tracker — Unlock Behavior
**Priority:** High

**Preconditions:**
- A student starts with the prerequisite course unchecked.
- The dependent course is locked.

**Steps:**
1. Render the `<Tracker />` component.
2. Simulate checking off the prerequisite course (`CS 111`).
3. Assert that the checkbox for `CS 212` is now **enabled** (not disabled).
4. Assert that the `"Prerequisites not done"` badge is no longer visible on `CS 212`.

**Expected Result:** After the prerequisite is marked complete, the previously locked course becomes checkable.

**Status:** ✅ Pass

---

## Sprint 1 Summary

| Test Case ID | Description | Status |
|---|---|---|
| TC-S1-01 | Google OAuth button renders and triggers flow | ✅ Pass |
| TC-S1-02 | Login blocks non-NEU domain emails | ✅ Pass |
| TC-S1-03 | Login blocks unenrolled NEU emails | ✅ Pass |
| TC-S1-04 | Map shows only enrolled student's courses | ✅ Pass |
| TC-S1-05 | Map shows correct year level and semester groupings | ✅ Pass |
| TC-S1-06 | Locked course checkbox is disabled when prerequisite incomplete | ✅ Pass |
| TC-S1-07 | Locked course shows "Prerequisites not done" badge | ✅ Pass |
| TC-S1-08 | Completing prerequisite unlocks dependent course | ✅ Pass |

**Total:** 8 test cases | **Passed:** 8 | **Failed:** 0
