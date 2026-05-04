# PE2-KM-Syllabus-Curriculum-Map

## KM Analyst Branch — EranJosh

This branch contains all Knowledge Management deliverables for the **CICS Curriculum Map System**, covering the Discovery phase through the Final Review.

---

### KM Deliverables

| Document | Description | Phase |
|----------|-------------|-------|
| [km-report.md](docs/km-report.md) | Problem statement, user/business goals, SECI framework proposal, assumptions and open questions | Discovery (Week 2) |
| [km-architecture.md](docs/km-architecture.md) | KM architecture overview, role-based access matrix, and BPMN process descriptions | Discovery (Week 2) |
| [BPMN Diagram V1.0.jpeg](docs/BPMN%20Diagram%20V1.0.jpeg) | Finalized BPMN process diagram (Lucidchart) — 5 role-based swim lanes covering Student, Faculty, Admin, Super Admin, and System | Sprint 1 (Week 5) |
| [km-mapping-sprint1.md](docs/km-mapping-sprint1.md) | SECI framework mapping for Sprint 1 features (Authentication & Login Flow) with gap analysis | Sprint 1 Review (Week 6) |
| [km-mapping-sprint2.md](docs/km-mapping-sprint2.md) | SECI framework mapping for Sprint 2 features (Core Functionalities) with gap analysis | Sprint 2 Review |
| [km-final-review.md](docs/km-final-review.md) | Final review — App vs. SECI Framework: comprehensive mapping table, gap analysis, and recommendations for Developer and Designer | Final Review |
| [prompt-log.md](prompt-log.md) | AI prompt documentation (3 entries covering Weeks 2, 5, and 6+) | Ongoing |

---

### Framework Used: SECI Model (Nonaka & Takeuchi)

The SECI model was selected as the KM framework for this project. It describes four modes of knowledge conversion:

| Mode | Direction | In Our System |
|------|-----------|---------------|
| **Socialization** | Tacit → Tacit | Faculty discussions, standup notes (not yet in-app) |
| **Externalization** | Tacit → Explicit | Admin enrollment forms, user management, course-prerequisite data |
| **Combination** | Explicit → Explicit | Curriculum map visualization, prerequisite validation engine, audit trail |
| **Internalization** | Explicit → Tacit | Students exploring the curriculum map, checking courses, discovering prerequisites |

---

### Key Findings (Final Review)

**Strongest area:** Combination — the curriculum map visualization is the system's core knowledge artifact, combining courses, prerequisites, and student progress into one interactive view.

**Main gap:** Socialization — the app manages explicit knowledge well but does not yet facilitate informal knowledge sharing between users. Recommended adding course-level comments/notes so faculty can explain *why* prerequisites exist.

**Overall coverage:** 3 out of 4 SECI modes implemented.

---

### Related Issues

| Issue | Title | Status |
|-------|-------|--------|
| #27 | Upload the finalized BPMN Diagram | Done |
| #31 | Framework mapping review for Sprint 1 | Done |
| #55 | Framework mapping review for Sprint 2 | Done |
| #56 | Final Review — App vs. Framework | Done |
| #18 | Update prompt-log.md | Done |

---

### Project Info

**Project:** CICS Curriculum Map System
**Domain:** College of Informatics and Computing Studies (BSCS, BSIT, BSIS, BSEMC)
**Tech Stack:** Supabase + Vercel + React/Tailwind
**Role:** KM (Knowledge Management) Analyst
**Team Lead:** JLNerecina
