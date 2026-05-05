# Prompt Log – KM Analyst

This document records all AI-assisted prompts used during the project.

---

## Entry #1

**Date:** April 5, 2026
**Phase:** Discovery (Week 2)
**Tool Used:** Claude (Anthropic)

**Purpose:**
To get help understanding the project requirements, organizing the deliverables for the KM Analyst role, and drafting the KM report memo and BPMN process diagram.

**Prompt Summary:**
Provided the project leader's messages (Week 1 kickoff instructions, user stories update, and KM Analyst-specific task assignment) along with handwritten meeting notes from the March 24 standup. Asked Claude to summarize what needed to be done and help create the deliverables step by step.

**What Was Generated:**
- `docs/km-report.md` — Problem statement, user/business goals, SECI framework proposal, assumptions and open questions.
- `docs/km-architecture.md` — KM architecture overview, role-based access table, BPMN process descriptions for three main workflows (Add/Update Course, Delete/Archive Course, Student Views Map), and SECI-to-feature mapping.

**What I Reviewed / Modified:**
- Verified that the role-based access structure matches what was discussed in the standup (Super Admin, Admin, Faculty, Student).
- Confirmed the per-year / per-semester concept was reflected in the documents.
- Cross-checked the BPMN processes against the meeting notes on system features.

**Lessons Learned:**
Breaking down long instructions into a clear task list made the requirements much easier to understand. The SECI model was a good fit for framing how curriculum knowledge moves from informal faculty discussions to a structured visual system.

---

## Entry #2

**Date:** April 26, 2026
**Phase:** Build Sprint 1 (Week 5)
**Tool Used:** Claude (Anthropic)

**Purpose:**
To create the finalized BPMN diagram based on the updated system specification PDF (CICS Curriculum Map Specification and Guide). Also used Claude to generate a reference diagram as a visual guide before recreating it in Lucidchart.

**Prompt Summary:**
Uploaded the full system specification PDF and screenshots of Lucidchart's BPMN 2.0 template (task boxes, gateway diamonds, start/end events, arrow styles, swim lane headers). Asked Claude to generate a PNG reference diagram matching Lucidchart's visual style, then used that as a guide to manually build the final diagram in Lucidchart.

**What Was Generated:**
- Reference BPMN diagrams (PNG) covering all 5 role-based processes: Student Login & Curriculum Interaction, Faculty Monitors Student Progress, Admin Enrollment & User Management, Super Admin Role & Access Management, and System Prerequisite Validation Engine.

**What I Reviewed / Modified:**
- Manually recreated the entire diagram in Lucidchart using proper BPMN 2.0 shapes (exclusive gateways with X markers, start/end events, task boxes).
- Chose separate swim lanes per role (not cross-lane) for clarity.
- Added color-coded start events per lane to match lane colors.
- Added title label: "BPMN Process Diagram — CICS Curriculum Map System" with subtitle "Knowledge Management Lifecycle — Per Role Process Flow".

**Lessons Learned:**
Using AI to generate a reference image first, then manually recreating in the proper tool, was much faster than starting from scratch in Lucidchart. The separate-lane approach was cleaner than cross-lane for this system since each role has its own independent workflow.

---

## Entry #3

**Date:** May 2, 2026
**Phase:** Build Sprint 1 Review / Sprint 2 (Week 6+)
**Tool Used:** Claude (Anthropic)

**Purpose:**
To create the Framework-to-App Mapping sections for Sprint 1 and Sprint 2, reviewing completed features against the SECI framework and identifying gaps. Also to create the final KM review document (App vs. Framework analysis).

**Prompt Summary:**
Provided the list of completed Sprint 1 and Sprint 2 features (from GitHub issues), the system specification PDF, and the existing km-report.md with the SECI framework. Asked Claude to map each feature to the relevant SECI mode and flag any gaps or recommendations.

**What Was Generated:**
- New section in `docs/km-report.md`: "Framework-to-App Mapping – Sprint 1"
- New section in `docs/km-report.md`: "Framework-to-App Mapping – Sprint 2"
- New file `docs/km-final-review.md`: Final review comparing the app against the SECI framework with a mapping table, gap analysis, and recommendations for the Developer and Designer.

**What I Reviewed / Modified:**
- Cross-referenced each Sprint feature against the actual system spec to ensure accuracy.
- Verified that the SECI mode assignments made sense for each feature.
- Reviewed gap recommendations to ensure they are actionable and relevant.

**Lessons Learned:**
The SECI framework mapped well to the system's features. Socialization (tacit-to-tacit) was the weakest area since the app focuses more on explicit knowledge management. Recommending discussion/comment features could address this gap in future sprints.
