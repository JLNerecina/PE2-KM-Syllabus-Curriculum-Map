# Decision Log
**Project:** Syllabus & Curriculum Map (Knowledge Mapping)  
**Role:** Project Manager (Scrum Master)  
**Last updated:** 2026-03-31

Every major team decision is recorded here (as required in guideline Part 2.4).

| # | Date     | Decision Made                                      | Options Considered                                      | Who Was Consulted     | Outcome / Rationale |
|---|----------|----------------------------------------------------|---------------------------------------------------------|-----------------------|---------------------|
| 1 | 03/24/2026 | Project scope and core concept: Role-based Syllabus & Curriculum Map using Knowledge Mapping (per year / per semester focus) | 1. Generic knowledge base<br>2. Full course management system with enrollment<br>3. Focused visual curriculum knowledge map with role-based access | All team members (kickoff meeting) | Chose #3 – Focused visual curriculum knowledge map with clear role-based system (Super Admin, Admin, Faculty, Student). Matches assigned project category and keeps scope realistic for 8-week timeline. |
| 2 | 03/24/2026 | Database: Supabase (NoSQL) as the backend database | Supabase vs Firebase/Firestore                          | All team members      | Chose Supabase – better free tier, easier real-time capabilities, and stronger integration with Vercel hosting. Directly supports knowledge mapping features (prerequisites, skills, curriculum nodes). |
| 3 | 03/24/2026 | Role-based access control system (Super Admin, Admin, Faculty, Student) | 1. Single user type<br>2. Role-based permissions with different dashboards | All team members      | Chose role-based system. Super Admin can manage admins + audit trail; Admin manages users; Faculty handles curriculum; Student has dedicated dashboard. This directly supports KM principles of knowledge capture, sharing, and access control. |
| 4 | 03/24/2026 | Branching strategy: Feature branches per role → PR reviews → merge to main (protected) | 1. Direct commits to main<br>2. Feature branches with mandatory PR review | All team members      | Chose feature branches per role (feature/pm, feature/developer, etc.) with protected main branch. Enforces guideline 2.1 (no direct commits to main, at least one PR per sprint). |
| 5 | 03/24/2026 | Sprint structure and milestones created (Kickoff, Discovery, Design, Build Sprint 1, Build Sprint 2 + Polish, Deployment & Defense) | Ad-hoc weekly tasks vs structured 8-week milestones with sprints | All team members      | Created full milestone structure in GitHub Issues + Projects board. Aligns exactly with guideline Part 1 timeline and enables clear tracking of velocity and story points starting next week. |

**Next major decisions to be logged (already in To Do):**  
- Final frontend framework confirmation  
- Vercel hosting configuration  
- User stories template and BPMN Diagram approval