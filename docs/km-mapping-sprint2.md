# Framework-to-App Mapping – Sprint 2

**Reviewer:** EranJosh (KM Analyst)
**Date:** May 2, 2026
**Framework Used:** SECI Model (Nonaka & Takeuchi)
**Sprint Scope:** Core Functionalities (Curriculum Map, User Management, Prerequisite Logic)

---

## Sprint 2 Features Reviewed

Sprint 2 focused on the core functionalities of the system — the curriculum map visualization, user management, prerequisite validation, and role-specific dashboards.

**Student: Curriculum view by year/semester** — Students can view the list of courses for their enrolled program, organized by year level and semester. Each course has a checkbox.

**Student: Prerequisite enforcement** — When a student taps a course, the system shows its prerequisite courses and the courses it unlocks. If prerequisites are not met, the checkbox is blocked. The "Select All" checkbox per semester is available for convenience.

**Faculty: Student monitoring dashboard** — Faculty can view their assigned programs, drill down by year level and section, search for specific students, and view a read-only version of the student's curriculum progress.

**Admin: User management** — Admins can view, add, edit, and soft-delete Faculty and Student accounts. A bulk enrollment form allows adding multiple students at once (by Program, Year, Section).

**Admin: Enrollment functionality** — Admins can enroll students into specific programs/curricula, which grants them access to the student dashboard and curriculum view.

**Super Admin: Admin role management** — Super Admins can add, edit, and soft-delete Admin accounts. The two system-reserved accounts (johnlian.nerecina@neu.edu.ph and jcesperanza@neu.edu.ph) are protected from edit/delete.

**UX/UI: Login page overhaul + curriculum tracker map** — Updated login UI and the main curriculum map visualization component.

---

## SECI Mapping Table – Sprint 2

| SECI Mode | Expected Activity | Sprint 2 Feature | Status | Notes |
|-----------|-------------------|-------------------|--------|-------|
| **Socialization** (Tacit → Tacit) | Users share informal knowledge through discussion or collaboration features | None built | Gap | The app still does not have comments, discussion threads, or any collaborative features. All informal knowledge sharing happens outside the system. |
| **Externalization** (Tacit → Explicit) | Faculty/admin input course data, define prerequisites, tag skills | Admin enrollment form converts enrollment decisions into structured DB records; Admin user management externalizes role assignments; Course-prerequisite relationships are now stored as explicit data | Fully Implemented | This is the strongest SECI mode in Sprint 2. The bulk enrollment form, user management, and prerequisite data structure all convert previously informal/undocumented decisions into structured system records. |
| **Combination** (Explicit → Explicit) | System cross-references courses, prerequisites, and enrollment data into a visual map | Curriculum map visualization combines course data + prerequisite chains + student progress into an interactive view; Faculty dashboard aggregates student data across programs/years/sections; Prerequisite validation engine (evaluateCourseStatus) cross-references completed courses against prerequisite rules | Fully Implemented | Sprint 2 is dominated by Combination activities. The curriculum map is the primary knowledge artifact — it takes scattered course records and prerequisite rules and combines them into a single visual representation. |
| **Internalization** (Explicit → Tacit) | Users explore the curriculum map and develop understanding of program structure | Students interact with the curriculum map — checking courses, seeing prerequisite chains, discovering what courses unlock next; Faculty view student progress and build awareness of how students move through the program | Implemented | The interactive curriculum map is a strong Internalization feature. Students build mental models of their academic path by exploring prerequisites and unlockable courses. Faculty internalize student progress patterns through the monitoring dashboard. |

---

## Gaps Identified – Sprint 2

**Gap 1: Socialization remains unaddressed.** This is the most significant gap across both sprints. The SECI model emphasizes that tacit-to-tacit knowledge sharing (Socialization) is the foundation of the knowledge creation cycle. Without it, the system only captures and organizes knowledge that has already been made explicit — it doesn't facilitate the creation of new knowledge through interaction.

**Recommendation for Developer/Designer:** Consider adding a comments or discussion feature on individual courses or prerequisite chains. For example, faculty could leave notes explaining *why* a course is a prerequisite (not just *that* it is), and students could ask questions. This would bring Socialization into the app.

**Gap 2: No knowledge tagging beyond prerequisites.** The system tracks prerequisite relationships but does not yet allow tagging courses with skills, competencies, or knowledge areas. This limits the depth of Externalization and Combination.

**Recommendation:** Add optional skill/knowledge tags to courses (e.g., "Object-Oriented Programming," "Database Design") so the curriculum map can visualize not just course sequence but also skill progression across the program.

**Gap 3: No historical versioning.** The system does not track how the curriculum has changed over time. When courses or prerequisites are modified, the previous version is lost.

**Recommendation:** Implement curriculum versioning (e.g., "AY 2025–2026 curriculum" vs. "AY 2026–2027 curriculum") so administrators can compare how the program structure has evolved. This supports the Combination mode by enabling cross-referencing across time.

---

## Summary

Sprint 2 delivered strong **Externalization**, **Combination**, and **Internalization** capabilities. The curriculum map visualization is the centerpiece — it transforms raw course and prerequisite data into an interactive knowledge artifact that users can explore and learn from. The main gap remains **Socialization**: the system captures and organizes explicit knowledge well, but does not yet facilitate the informal, collaborative knowledge sharing that drives innovation in curriculum design.
