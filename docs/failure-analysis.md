

# Failure Analysis Report: Syllabus & Curriculum Map

**Project:** Syllabus & Curriculum Map (KM System)  
**Document Owner:** @BaiSakinaAbad (QA & Documentation Lead)  
**Status:** All Issues Resolved

## Executive Summary
This report documents the identification and resolution of five critical system failures discovered during the Sprint 1 & 2 testing phases. Fixes were focused on state synchronization, authentication security, and data persistence.

---

## Bug Tracking Summary

| ID | Issue Description | Category | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Non-registered users get "Infinite Loading" | Auth / UX | Forced Sign-out + Warning Pop-up | ✅ Fixed |
| **02** | Blocked users bypass security via session | Security | Enforced Server-Side Sign-out | ✅ Fixed |
| **03** | Term selection resets to 1st Year on login | Persistence | LocalStorage + Progress Mapping | ✅ Fixed |
| **04** | Audit search fails on "System" or specific actions | Data / UI | Expanded Search Logic + Null Handling | ✅ Fixed |
| **05** | Tab Switch triggers infinite loading state | State Mgmt | UseEffect Cleanup & Refactored Auth | ✅ Fixed |

---

##  Detailed Analysis

### Bug 01: Unauthorized Access "Infinite Loading"
**Root Cause:** The application state was setting `isLoading` to `false` before the Supabase profile fetch was complete. If a Google user had no entry in our `profiles` table, the app entered an inconsistent state (authenticated but no data).

**Resolution:**
* **AuthContext Logic:** Modified `isLoading` to remain `true` until the profile fetch is verified.
* **Auto Sign-out:** If no profile is found, the system triggers `supabase.auth.signOut()` immediately.
* **User Feedback:** Implemented a 10-second error visibility duration on the login screen with the message: *"The person attempting to log in is not authorized... contact system administration."*

---

### Bug 02: Blocked User Persistence
**Root Cause:** The `is_deleted` flag was being ignored by the frontend session after the initial login, allowing blocked users to remain active until their token expired.

**Resolution:**
* **Middleware Check:** Modified `src/contexts/AuthContext.tsx` to verify the `is_deleted` field during app initialization.
* **Termination:** If `is_deleted === true`, the session is terminated server-side.
* **Feedback:** Users are greeted with: *"Your account has been blocked. Please contact system administration."*

---

### Bug 03: Term Selection Persistence (User Experience)
**Root Cause:** The application defaulted to 1st Year/1st Semester upon every login, ignoring previous student progress or manual navigation.

**Resolution:**
* **Smart Initialization:** Added logic to check `localStorage` (scoped by `targetUserId`) and analyze the curriculum to find the first non-completed term.
* **State Persistence:** Implemented `hasInitialized` state in `Tracker.tsx` to ensure the transition from default state to the student's actual progress is seamless.

---

### Bug 04: Audit Trail Search Inconsistency
**Root Cause:** The search filter was strictly checking the `actor_name` database field. It failed when searching for "System" (where the name is null) or specific human-readable labels like "Profile Edit."

**Resolution:**
* **Expanded Logic:** Updated `AuditTrailTab.tsx` to match against Actor, Action (raw and label), Target, and Summary.
* **System Fallback:** Added a check for null `actor_name` to ensure that searching for "System" captures automated logs.

---

### Bug 05: Tab Switch State Lock (Browser Context)
**Root Cause:** Switching browser tabs or losing focus caused the auth state to hang, requiring a hard refresh to regain access to the UI.

**Resolution:**
* **Refactored Auth Listener:** Cleaned up the `onAuthStateChange` listeners in the root provider.
* **Vercel Config:** Added `vercel.json` to handle SPA routing rewrites, preventing 404s or state hangs when the browser context changes.

---
The system now adheres to strict **Knowledge Management** principles by ensuring data integrity (Persistence) and secure knowledge access (Auth/Blocked logic). All identified blockers have been verified as resolved in the `v1.0.0` release.
