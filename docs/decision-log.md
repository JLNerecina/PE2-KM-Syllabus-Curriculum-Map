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
| 6 | 04/02/2026 | Approval of initial UI wireframes                  | Minimal style vs more complex UI            | PM + UX/UI Designer   | Approved the 4 submitted wireframes (Dashboard, Editor, Profile, Visualizer). Clean minimal design chosen as it best supports knowledge mapping visualization. |
| 7 | 04/09/2026 | Start of Build Sprint 1 + approval of full sprint plan | Ad-hoc tasks vs structured sprint plan      | All members           | Approved detailed Sprint 1 & Sprint 2 plan with assignments and timeline. Developer will build core features while others work in parallel on their deliverables. |
| 8 | 04/09/2026 | Final BPMN diagram assigned to KM Analyst          | Keep text-only BPMN vs add visual diagram   | All members           | Assigned final visual BPMN diagram (using Lucidchart) to KM Analyst (Eran Josh). This will complete the KM architecture deliverable. |
| 9 | 04/09/2026 | Project scaffold completed and approved | Basic React/Next.js + Supabase setup vs other frameworks | All members (PM + Developer) | Scaffold is now complete and approved. Developer can immediately start Sprint 1 stories. This marks the official start of Build Sprint 1. |
|10 | 04/09/2026 | QA & Docs Lead completed CONTRIBUTING.md and CHANGELOG.md | Ad-hoc documentation vs structured guideline-compliant docs | All members | CONTRIBUTING.md and CHANGELOG.md are now in place as required by the guideline. |

**Next major decisions to be logged (already in To Do):**  
- Final frontend framework confirmation  
- Vercel hosting configuration  
- User stories template and BPMN Diagram approval
