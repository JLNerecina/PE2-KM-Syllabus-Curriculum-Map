# User Stories
**Project:** Syllabus & Curriculum Map (Knowledge Mapping)  
**Version:** 1.0  
**Date:** 2026-03-31  
**Prepared by:** Project Manager (Scrum Master)

This document contains all user stories for the project. Stories follow the format:  
**As a [role], I want [feature] so that [benefit].**  
Story points use Fibonacci scale (1, 2, 3, 5, 8, 13).  
Total project points: **68**

### Full Product Backlog

| ID      | User Story                                                                 | Story Points | Priority |
|---------|----------------------------------------------------------------------------|--------------|----------|
| US-01   | As a **Super Admin**, I want to create and manage Admin accounts so that I can control access levels | 3            | High     |
| US-02   | As a **Super Admin**, I want to view an audit trail of all changes so that I can track knowledge modifications | 5            | High     |
| US-03   | As an **Admin**, I want to manage Faculty and Student accounts (create, edit, archive) so that I can maintain user data | 5            | High     |
| US-04   | As a **Faculty**, I want to add/edit/delete courses with prerequisites and skills so that I can build the curriculum map | 8            | High     |
| US-05   | As a **Faculty**, I want to link courses with prerequisite relationships so that the knowledge flow is correctly mapped | 8            | High     |
| US-06   | As a **Student**, I want a personal dashboard that shows my program’s curriculum map so that I can see my learning path | 5            | High     |
| US-07   | As any **authenticated user**, I want to view the interactive visual curriculum map (nodes + edges) so that I can understand course connections | 13           | High     |
| US-08   | As any **authenticated user**, I want to filter/search the map by year, semester, or skill so that I can quickly find relevant knowledge | 5            | High     |
| US-09   | As a **Faculty/Student**, I want to click on a course node to see detailed skills learned and prerequisites so that I can understand knowledge dependencies | 5            | Medium   |
| US-10   | As an **Admin**, I want to restore archived courses or users so that data is never permanently lost | 3            | Medium   |
| US-11   | As a **Super Admin**, I want to export the entire curriculum map as JSON/PDF so that it can be shared or backed up | 3            | Low      |
| US-12   | As any **user**, I want a responsive mobile-friendly map view so that I can access it on any device | 5            | Low      |

### Sprint 1: Authentication & Log-in Flow
**Goal:** Secure role-based login and basic dashboards.  
**Total points:** **21**  
**Status:** Ready to start

| Story ID | Description                                      | Points |
|----------|--------------------------------------------------|--------|
| US-01    | Super Admin – manage Admin accounts              | 3      |
| US-02    | Super Admin – audit trail                        | 5      |
| US-03    | Admin – manage Faculty/Student accounts          | 5      |
| US-06    | Student – personal dashboard (basic version)     | 5      |
| US-07 (partial) | Basic auth + role-based redirection       | 3      |

**Sprint 1 Deliverables:** Full login flow with Supabase Auth, role-based dashboards, and audit trail foundation.

### Sprint 2: Core Functionalities
**Goal:** Build the visual knowledge mapping engine.  
**Total points:** **26**  
**Status:** Ready after Sprint 1

| Story ID | Description                                      | Points |
|----------|--------------------------------------------------|--------|
| US-04    | Faculty – add/edit/delete courses                | 8      |
| US-05    | Faculty – link prerequisite relationships        | 8      |
| US-07    | Interactive visual curriculum map (nodes + edges)| 5      |
| US-08    | Filter/search the map                            | 5      |

**Sprint 2 Deliverables:** Course CRUD, graph visualization, search/filter, full integration with Sprint 1.

**Team Velocity Target:** 20–25 points per sprint (will be measured after Sprint 1).  
These stories directly support the KM framework (visualization of knowledge flow, externalization of curriculum knowledge, and combination of skills across years/semesters).
