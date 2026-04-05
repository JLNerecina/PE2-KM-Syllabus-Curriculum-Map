# KM Architecture & BPMN Process Diagram

**Project:** PE2 – Syllabus & Curriculum Map  
**Role:** KM (Knowledge Management) Analyst  
**Date:** April 5, 2026  
**Phase:** Discovery (Week 2)

---

## 1. Knowledge Architecture Overview

The Syllabus & Curriculum Map system manages three layers of knowledge:

**Data Layer** — Raw curriculum data stored in Supabase: course records, prerequisite links, skill/knowledge tags, user accounts, and audit logs.

**Process Layer** — The workflows through which knowledge enters, gets validated, and is maintained in the system. This is what the BPMN diagram below describes.

**Presentation Layer** — The curriculum map visualization that transforms stored data into an interactive, filterable view for each user role (Student, Faculty, Admin, Super Admin).

---

## 2. Role-Based Access Summary

| Role | Can View | Can Create/Edit | Can Delete | Special Permissions |
|------|----------|-----------------|------------|---------------------|
| **Super Admin** | Everything | Admins, system settings | Any record | Audit trail access, system configuration |
| **Admin** | All curriculum data | Courses, prerequisites, faculty accounts | Courses (with approval) | Manage students and faculty, restore deleted items |
| **Faculty** | Curriculum map, own courses | Propose course edits, add skill tags | — | View prerequisite chains for their courses |
| **Student** | Curriculum map (read-only) | — | — | Filter by year/semester, view own academic path |

---

## 3. BPMN Process Diagram: Curriculum Knowledge Management Lifecycle

Below is a textual description of the BPMN (Business Process Model and Notation) diagram for the main knowledge flow in the system. This covers how curriculum data enters the system, gets validated, and becomes part of the visible curriculum map.

---

### Process: Add / Update Course in Curriculum Map

**Participants (Pools):**
- Faculty
- Admin
- System (Supabase + Application)
- Student (end consumer)

---

**Start Event:** Faculty or Admin identifies a need to add or update a course in the curriculum map.

**Flow:**

1. **Faculty submits course data** (Task)  
   Faculty fills in course details: course code, name, description, year level, semester, prerequisite courses, and skill/knowledge tags.

2. **System validates input** (Service Task)  
   The application checks for required fields, verifies that listed prerequisites exist in the database, and flags any circular prerequisite chains (e.g., Course A requires Course B which requires Course A).

3. **Validation passed?** (Exclusive Gateway)  
   - **No →** System returns error with details. Faculty corrects and resubmits (loops back to Step 1).  
   - **Yes →** Proceed to Step 4.

4. **Admin reviews submission** (User Task)  
   Admin receives a notification that a course submission is pending review. Admin checks the data for accuracy, appropriateness of prerequisite links, and alignment with program goals.

5. **Admin approves?** (Exclusive Gateway)  
   - **No →** Admin sends feedback to Faculty with requested changes. Faculty revises and resubmits (loops back to Step 1).  
   - **Yes →** Proceed to Step 6.

6. **System saves course to database** (Service Task)  
   Course record is created/updated in Supabase. Prerequisite relationships are stored. Skill/knowledge tags are indexed.

7. **System logs change in audit trail** (Service Task)  
   An audit log entry is created: who made the change, what was changed, timestamp, and approval reference.

8. **System updates curriculum map** (Service Task)  
   The curriculum visualization is regenerated/updated to include the new or modified course and its connections.

9. **Student views updated curriculum map** (User Task)  
   Students can now see the updated course, its position in the prerequisite chain, and the skills it builds — filtered by their year level and semester.

**End Event:** Course is live on the curriculum map and visible to all users per their role permissions.

---

### Process: Delete / Archive a Course

**Start Event:** Admin identifies a course that needs to be removed (e.g., deprecated, merged with another course).

1. **Admin selects course for deletion** (User Task)
2. **System checks dependencies** (Service Task) — Are other courses listing this as a prerequisite?
3. **Dependencies exist?** (Exclusive Gateway)
   - **Yes →** System warns Admin and lists affected courses. Admin must resolve dependencies first (reassign prerequisites or update affected courses).
   - **No →** Proceed to Step 4.
4. **Admin confirms deletion** (User Task)
5. **System archives course** (Service Task) — Course is soft-deleted (kept in database but hidden from the map). Super Admin can restore if needed.
6. **System logs deletion in audit trail** (Service Task)
7. **Curriculum map updates** (Service Task)

**End Event:** Course is removed from the active curriculum map.

---

### Process: Student Views Curriculum Map

**Start Event:** Student logs into the system.

1. **System authenticates student** (Service Task) — via Supabase Auth.
2. **Student selects filters** (User Task) — Year level, semester, or specific course.
3. **System queries curriculum data** (Service Task) — Fetches courses, prerequisites, and skill tags matching the filter.
4. **System renders curriculum map** (Service Task) — Displays interactive visualization showing course nodes, prerequisite edges, and skill/knowledge labels.
5. **Student explores the map** (User Task) — Clicks on courses to see details, follows prerequisite chains, views skills acquired.

**End Event:** Student has accessed and understood their curriculum pathway.

---

## 4. Knowledge Flow Summary (SECI Mapping to System Features)

| SECI Mode | Knowledge Activity | System Feature |
|-----------|-------------------|----------------|
| Socialization | Faculty discuss curriculum informally | Discussion threads / comments on courses |
| Externalization | Faculty document course details and prerequisites | Course data entry forms, skill tagging |
| Combination | System cross-references all courses into a visual map | Curriculum map visualization, filtering |
| Internalization | Students and faculty gain understanding from the map | Interactive dashboard, prerequisite chain explorer |

---

## 5. Technology Alignment

- **Supabase** — Handles authentication (role-based login), PostgreSQL database (course records, prerequisites, audit logs), and real-time updates.
- **Vercel** — Hosts the frontend application, provides fast deployment and previews for each branch/PR.
- **Frontend Framework** — (To be confirmed by developer) — Renders the curriculum map visualization and role-based dashboards.
