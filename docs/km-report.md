# KM Analyst Report: Problem Statement & Framework Memo

**Project:** PE2 – Syllabus & Curriculum Map  
**Role:** KM (Knowledge Management) Analyst  
**Date:** April 5, 2026  
**Phase:** Discovery (Week 2)

---

## 1. Problem Statement

Academic programs often lack a clear, visual representation of how individual courses connect to one another across semesters and year levels. Students struggle to understand why certain courses are prerequisites, what skills each course builds, and how the knowledge they gain compounds throughout their program. Faculty and administrators, meanwhile, have no centralized tool to see whether the curriculum has gaps, redundancies, or misaligned learning outcomes. This project aims to build a Knowledge Mapping web application that makes these connections visible and actionable — giving every stakeholder (students, faculty, and administrators) a shared understanding of the curriculum's structure and flow.

---

## 2. Key User and Business Goals

**User Goals:**

- **Students** need to see a clear path through their program — understanding which courses to take, in what order, and what knowledge/skills each one builds toward.
- **Faculty** need to verify that their course fits logically within the broader curriculum and that prerequisites are appropriate.
- **Administrators (Admin / Super Admin)** need to manage curriculum data, track changes over time, and identify structural issues like missing prerequisites or skill gaps.

**Business / Institutional Goals:**

- Improve student advising and reduce enrollment in courses without proper prerequisites.
- Provide a data-driven view of curriculum design for accreditation and program review.
- Centralize curriculum knowledge that currently exists only in scattered documents or in individuals' heads.

**Success Criteria:**

- All courses in a program can be visualized with their prerequisite chains and skill/knowledge tags.
- Users can filter the curriculum map by year level and semester.
- Faculty can propose changes that are tracked and auditable.
- The system supports role-based access so each user type sees relevant information and controls.

---

## 3. Proposed KM Framework: SECI Model (Nonaka & Takeuchi)

The **SECI Model** is well-suited for this project because curriculum knowledge exists in multiple forms — some of it is written down (explicit), and some of it lives only in the minds of faculty and program designers (tacit). The SECI model describes four modes of knowledge conversion:

### Socialization (Tacit → Tacit)
Faculty and department heads share unwritten insights about why courses are sequenced a certain way, what skills students typically struggle with, and informal prerequisite expectations. This happens through meetings, standups, and discussions — knowledge that hasn't been documented yet.

**In our system:** The standup notes and discussion logs capture this tacit-to-tacit sharing. The system should support comments or discussion threads on curriculum items.

### Externalization (Tacit → Explicit)
The tacit knowledge from faculty is converted into structured, documented form — course descriptions, prerequisite rules, skill tags, and learning outcomes written into the system.

**In our system:** Faculty and admins input course data, define prerequisite relationships, and tag skills/knowledge areas. The curriculum map itself is the externalized knowledge artifact.

### Combination (Explicit → Explicit)
Existing explicit knowledge (syllabi, course catalogs, accreditation documents) is reorganized, cross-referenced, and combined into the visual curriculum map.

**In our system:** The application combines course records, prerequisite data, and skill tags into an interactive visualization. Filtering by year/semester and viewing prerequisite chains are combination activities.

### Internalization (Explicit → Tacit)
Users interact with the curriculum map and develop a deeper, intuitive understanding of how the program is structured — students plan their academic path, faculty see where their course fits in the bigger picture.

**In our system:** The visualization and dashboard features help users internalize the curriculum structure. Over time, students and faculty build mental models of the program flow.

---

## 4. Assumptions and Open Questions

**Assumptions:**

- The system will initially cover one academic program as a pilot before expanding.
- Course data (names, codes, descriptions, prerequisites) is available or can be gathered from existing syllabi and catalogs.
- The per-year / per-semester structure follows a standard academic calendar.
- Role-based access follows the structure discussed in Week 1: Super Admin > Admin > Faculty > Student, with each role having progressively fewer permissions.
- Supabase will handle both authentication and the relational database for courses, prerequisites, and user data.

**Open Questions:**

- How granular should skill/knowledge tags be? (e.g., broad categories like "Programming" vs. specific ones like "Object-Oriented Design in Java")
- Will faculty be able to directly edit curriculum data, or only propose changes that an admin approves?
- Should the system track historical curriculum versions (e.g., "this was the prerequisite chain in AY 2024–2025")?
- How will we handle elective courses that don't have fixed positions in the prerequisite chain?
- What is the source of truth for course data — will it be manually entered or imported from an existing system?
