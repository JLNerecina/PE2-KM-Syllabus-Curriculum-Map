# KM Final Review — App vs. Framework

**Project:** PE2 – CICS Curriculum Map System
**Reviewer:** EranJosh (KM Analyst)
**Date:** May 2, 2026
**Framework:** SECI Model (Nonaka & Takeuchi)

---

## 1. Purpose

This document is the final Knowledge Management review for the CICS Curriculum Map System. It evaluates the completed application against the SECI framework proposed during the Discovery phase, identifies gaps between what the framework requires and what was built, and provides specific recommendations for the Developer and Designer.

---

## 2. Framework-to-App Mapping Table (Overall)

| SECI Mode | What the Framework Requires | What the App Delivers | Coverage |
|-----------|---------------------------|----------------------|----------|
| **Socialization** (Tacit → Tacit) | A mechanism for users to share informal, unwritten knowledge — e.g., why certain courses are sequenced a specific way, what common student struggles are, faculty insights about curriculum gaps | Nothing. All informal knowledge sharing happens outside the app (group chats, standups, in-person). | **Not covered** |
| **Externalization** (Tacit → Explicit) | Tools to convert informal decisions into structured data — course definitions, prerequisite rules, role assignments, enrollment records | Google OAuth with role-based access; Admin enrollment forms (bulk + individual); User management (add/edit/soft-delete); Course-prerequisite data structure in Supabase; Protected Super Admin accounts | **Fully covered** |
| **Combination** (Explicit → Explicit) | System that cross-references, organizes, and visualizes explicit data from multiple sources into new knowledge artifacts | Curriculum map visualization (courses + prerequisites + progress in one view); Faculty monitoring dashboard (aggregates student data across programs/years/sections); Prerequisite validation engine (evaluateCourseStatus); Audit trail (aggregates system actions into a log); Role-based redirection (combines auth state + profile data) | **Fully covered** |
| **Internalization** (Explicit → Tacit) | Interactive features that help users build understanding and mental models through exploration | Students explore the curriculum map — checking courses, viewing prerequisite chains, discovering unlockable courses; Faculty monitor student progress and build awareness of program flow; Login flow teaches users the system's structure through interaction | **Mostly covered** |

---

## 3. Gap Analysis

### Gap 1: Socialization — No In-App Knowledge Sharing (Critical)

**What's missing:** The SECI model positions Socialization as the starting point of the knowledge creation spiral. Without it, the system is a knowledge *repository* (storing and organizing existing knowledge) but not a knowledge *creation* platform (generating new insights through interaction).

**Impact:** Faculty who know *why* Course A is a prerequisite for Course B have no way to share that reasoning within the system. Students who struggle with a course have no way to flag it. The curriculum map shows *what* the structure is but not *why* it exists.

**Recommendation for Developer:** Add a comments/notes feature on individual courses. Faculty can leave explanatory notes (e.g., "This course builds the OOP foundation needed for Data Structures"). Students can view these notes when tapping a course. Implementation: a `course_notes` table in Supabase with fields for course_id, author_id, note_text, and timestamp.

**Recommendation for Designer:** Design a slide-over or expandable section within the course detail modal that shows "Faculty Notes" and "Why This Prerequisite?" explanations. Keep it read-only for students, editable for faculty.

---

### Gap 2: No Skill/Knowledge Tagging (Moderate)

**What's missing:** Courses are linked by prerequisite relationships, but there is no tagging system for skills or competencies (e.g., "Programming," "Database Design," "Systems Analysis"). The curriculum map shows *sequence* but not *skill progression*.

**Impact:** The Combination mode is partially limited — the system combines courses and prerequisites but cannot show how specific skills build across the program.

**Recommendation for Developer:** Add a `skills` table and a `course_skills` junction table. Each course can be tagged with one or more skills. The curriculum map can then optionally visualize skill pathways alongside course sequences.

**Recommendation for Designer:** Add a "Skills" filter or toggle to the curriculum map view, allowing users to highlight courses by skill area (e.g., show all courses that build "Database" skills).

---

### Gap 3: No Curriculum Versioning (Low Priority)

**What's missing:** When courses or prerequisites are modified, the previous state is overwritten. There is no way to compare curriculum structures across academic years.

**Impact:** Administrators and accreditation reviewers cannot see how the program has evolved over time. The Combination mode would be strengthened by enabling cross-temporal analysis.

**Recommendation:** This is a future enhancement. If pursued, implement a `curriculum_versions` table that snapshots the course structure at the start of each academic year.

---

## 4. Strengths

The application excels in three areas of the SECI model:

**Externalization is comprehensive.** The enrollment system, user management, and course-prerequisite data structure effectively convert previously informal decisions (who is enrolled where, what courses require what) into structured, enforceable records. The role-based access control ensures that Externalization is maintained — only authorized users can modify explicit knowledge.

**Combination is the standout feature.** The curriculum map visualization is the system's core knowledge artifact. It takes scattered data (courses, prerequisites, student progress, enrollment records) and combines them into a single interactive view. The prerequisite validation engine (evaluateCourseStatus) is a sophisticated Combination mechanism — it cross-references completed courses against prerequisite rules in real time.

**Internalization is well-supported through interactivity.** The curriculum map is not just a static display — students actively engage with it by checking courses, exploring prerequisites, and discovering what courses unlock next. This interaction drives Internalization, helping students build a mental model of their academic path.

---

## 5. Final Assessment

| Criteria | Rating |
|----------|--------|
| Framework alignment (SECI coverage) | 3 out of 4 modes covered |
| Strongest SECI mode | Combination |
| Weakest SECI mode | Socialization (not addressed) |
| Overall KM maturity | **Functional** — the system manages explicit knowledge effectively but does not yet facilitate knowledge creation through collaboration |
| Priority recommendation | Add course-level comments/notes to enable Socialization |

---

## 6. Recommendations Summary for Developer and Designer

| # | Recommendation | SECI Mode Addressed | Priority | Assigned To |
|---|---------------|-------------------|----------|-------------|
| 1 | Add course comments/notes feature (faculty can explain prerequisites, students can view) | Socialization | High | Developer + Designer |
| 2 | Add skill/knowledge tags to courses with filter on curriculum map | Combination + Externalization | Medium | Developer + Designer |
| 3 | Implement curriculum versioning for cross-year comparison | Combination | Low | Developer |
| 4 | Add a "Why This Prerequisite?" section in the course detail modal | Socialization + Internalization | High | Designer |
