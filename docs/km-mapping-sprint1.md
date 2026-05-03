# Framework-to-App Mapping – Sprint 1

**Reviewer:** EranJosh (KM Analyst)
**Date:** May 2, 2026
**Framework Used:** SECI Model (Nonaka & Takeuchi)
**Sprint Scope:** Authentication & Login Flow

---

## Sprint 1 Features Reviewed

Sprint 1 focused on the authentication layer and basic role-based access. The following features were planned and completed:

**US-07: Google OAuth authentication** — Users log in via @neu.edu.ph Google accounts. The system checks whether the user exists in the profiles table. If not enrolled, a modal displays "You are not yet enrolled in any program" and the user is signed out.

**US-07 (continued): Role-based redirection** — After successful login, the system reads the user's role from the profiles table and redirects them to the appropriate dashboard (Student, Faculty, Admin, or Super Admin).

**US-06: Student basic personal dashboard** — A placeholder dashboard view for authenticated students, showing their assigned program.

**US-02: Super Admin audit trail view** — Super Admins can view a log of system actions (who did what, when).

**UX/UI: Wireframes converted to React components** — The login page, error modal, and basic dashboard layouts were built as functional React/Tailwind components.

**QA: Test cases for authentication flow** — Test cases covering valid login, invalid domain, unenrolled user, and role-based redirection scenarios.

---

## SECI Mapping Table – Sprint 1

| SECI Mode | Expected Activity | Sprint 1 Feature | Status | Notes |
|-----------|-------------------|-------------------|--------|-------|
| **Socialization** (Tacit → Tacit) | Faculty/admin discuss curriculum informally; team standups share unwritten knowledge | Standup notes in /docs/standups/ | Partial | Standups capture some tacit knowledge, but the app itself does not yet facilitate user-to-user discussion. |
| **Externalization** (Tacit → Explicit) | Tacit knowledge is structured into the system — course data, prerequisites, roles | Google OAuth + role assignment in profiles table; Admin pre-enrolls users with role, program, and section data | Implemented | The enrollment process converts the implicit decision of "who has what role" into explicit database records. Authentication enforces these explicit rules. |
| **Combination** (Explicit → Explicit) | Existing explicit data is reorganized, cross-referenced, and combined | Role-based redirection combines profile data + auth state to route users; Audit trail combines action logs from multiple users into a single view | Implemented | The audit trail is a strong Combination feature — it aggregates explicit system events into an organized, queryable log. |
| **Internalization** (Explicit → Tacit) | Users interact with the system and build mental models | Student dashboard (basic); Login flow teaches users how the system works | Partial | The dashboard is still a placeholder. Once curriculum data is displayed, Internalization will be stronger. Users do learn the login flow through interaction. |

---

## Gaps Identified – Sprint 1

**Gap 1: No Socialization features in the app.** The system does not yet provide any mechanism for users to discuss, comment, or share informal knowledge within the app. All socialization happens outside the system (in standups, group chats). This is expected for Sprint 1 but should be considered for future sprints.

**Gap 2: Student dashboard is a placeholder.** The Internalization mode depends on users being able to explore and interact with curriculum data. The current basic dashboard does not yet show courses, prerequisites, or program structure. This is a Sprint 2 deliverable.

**Gap 3: No knowledge tagging or categorization yet.** The Externalization mode will be fully realized when faculty/admins can tag courses with skills and knowledge areas. Sprint 1 only covers authentication, not content management.

---

## Summary

Sprint 1 successfully established the **Externalization** and **Combination** layers of the SECI model — users and roles are now explicit database records, and the audit trail aggregates system actions. **Socialization** and **Internalization** are expected to strengthen in Sprint 2 when the curriculum map and course interaction features are built.
