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
