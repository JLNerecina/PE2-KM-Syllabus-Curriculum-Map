
### QA Test Case Log: Role-Based Syllabus & Knowledge Mapping
**Phase:** Build Week 1, 2 & 3
**Prepared by:** QA & Documentation Lead
**Deliverable:** /docs/test-cases/

| Test ID | Category | Title & Scenario | Pre-conditions | Test Data (Valid/Invalid) | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | **Auth** | Valid Login - Faculty Role | Account exists in DB | **V:** faculty_user / pass123 | Dashboard loads with "Upload Syllabus" permissions. | [Pass/Fail] |
| **TC-002** | **Auth** | Valid Login - Student Role | Account exists in DB | **V:** student_user / pass123 | Dashboard loads with "View Map" only permissions. | [Pass/Fail] |
| **TC-003** | **Security** | **Negative Test:** Invalid Password | Registered Email | **I:** user@school.edu / wrongpass | Access denied; "Invalid credentials" error triggers. | [Pass/Fail] |
| **TC-004** | **Security** | Session Logout Integrity | User is logged in | **V:** N/A | Clicking 'Logout' clears session; user cannot view data via 'Back' button. | [Pass/Fail] |
| **TC-005** | **Security** | Unauthorized URL Access | Logged in as Student | **I:** `/admin/taxonomy-edit` | System redirects to 403 Forbidden or Home Dashboard. | [Pass/Fail] |
| **TC-006** | **Functional** | Syllabus PDF Upload & Parse | Faculty Role active | **V:** `CS101_Syllabus.pdf` | File parses; keywords extracted per SECI externalization. | [Pass/Fail] |
| **TC-007** | **Functional** | Create Knowledge Tag | Developer set up DB  | **V:** "Cloud Computing" | New tag appears in the Knowledge Architecture taxonomy. | [Pass/Fail] |
| **TC-008** | **Functional** | Search by Keyword | 10+ Syllabi uploaded  | **V:** "Python" | App returns all knowledge items tagged with "Python". | [Pass/Fail] |
| **TC-009** | **Functional** | Filter Map by Year Level | Taxonomy is defined  | **V:** "Year 3" | Only curriculum nodes for Year 3 are visible on the map. | [Pass/Fail] |
| **TC-010** | **Functional** | Empty Search Handling | Search bar is empty  | **I:** [Null Input] | App displays "Please enter a keyword" or shows all items. | [Pass/Fail] |
| **TC-011** | **Usability** | Knowledge Map Navigation | UI wireframes followed  | **V:** N/A | Clicking a node expands details without losing map context. | [Pass/Fail] |
| **TC-012** | **Usability** | Mobile Responsive View | App deployed to URL  | **V:** 375px viewport width | Menu collapses to hamburger icon; Map is draggable. | [Pass/Fail] |
| **TC-013** | **Regression** | Tag Integrity After Edit | Sprint 2 Build  | **V:** "Legacy Tag" | Renaming a category updates all linked syllabus entries. | [Pass/Fail] |
| **TC-014** | **Performance** | Map Render Speed | 50+ curriculum nodes  | **V:** N/A | Knowledge Map renders in < 3 seconds to reduce cognitive load. | [Pass/Fail] |
| **TC-015** | **Functional** | Export Curriculum Map | Valid Map generated  | **V:** .png or .pdf | Current map view downloads as a high-res file for offline study. | [Pass/Fail] |

---

_Next entries will be added as sprints continue and Testing._