# Architectural Decision Records (ADR)

This document records the major architectural decisions made during the development of the **PE2 KM Syllabus & Curriculum Map** project.

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use React 19 + TypeScript for Frontend |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Need a dynamic, maintainable UI for complex curriculum mapping and student tracking. |
| **Options Considered** | 1. Vanilla JS/HTML, 2. Vue.js, 3. React + TypeScript |
| **Decision** | **React + TypeScript** - Industry standard for complex SPAs with strong type safety. |
| **Consequences** | Faster development, better IDE support, higher code quality, initial learning curve for TS. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use Vite for Build and Development |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Need fast development feedback and modern build optimizations. |
| **Options Considered** | 1. Webpack/CRA, 2. Next.js, 3. Vite |
| **Decision** | **Vite** - Instant Hot Module Replacement (HMR) and high-performance ESM-based development. |
| **Consequences** | Improved developer productivity, faster builds, native ESM support. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use Tailwind CSS v4 for Styling |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Need a consistent design system and rapid styling without global CSS conflicts. |
| **Options Considered** | 1. CSS Modules, 2. Styled Components, 3. Tailwind CSS v4 |
| **Decision** | **Tailwind CSS v4** - Utility-first approach with high-performance engine optimizations. |
| **Consequences** | Rapid UI iteration, consistent design system, small bundle size. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use Supabase for Backend and Database |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Need robust database, authentication, and real-time features without custom backend overhead. |
| **Options Considered** | 1. Firebase, 2. Custom Node/Express + Postgres, 3. Supabase |
| **Decision** | **Supabase** - Open-source Postgres-based BaaS with excellent React integration. |
| **Consequences** | Reduced development time, built-in RLS security, vendor dependency. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use Google OAuth only as Login Method |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Simplify onboarding and ensure secure, verified institutional access. |
| **Options Considered** | 1. Email/Password, 2. Multiple OAuth providers, 3. Google OAuth Only |
| **Decision** | **Google OAuth Only** - Simplest user experience and highest security for academic institutional use. |
| **Consequences** | Faster login flow, offloaded credential security, requirement for Google account. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Implement Protected Role-Based Routes |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Different user levels (Superadmin, Admin, Faculty, Student) need restricted access to specific features. |
| **Options Considered** | 1. Single dashboard with conditional rendering, 2. Role-based routing |
| **Decision** | **Role-based routing** - Clean separation of concerns and clear access boundaries in the UI. |
| **Consequences** | Secure administrative areas, clear user flows, requires careful profile role syncing. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Deploy on Vercel for CI/CD and Hosting |
| **Date** | 04/02/2026 |
| **Status** | Decided |
| **Context** | Need reliable hosting and automated CI/CD pipeline for the React application. |
| **Options Considered** | 1. Netlify, 2. GitHub Pages, 3. Vercel |
| **Decision** | **Vercel** - Best-in-class support for React/Vite and seamless integration with GitHub. |
| **Consequences** | Automated preview deployments, excellent performance via edge network. |

---

| ADR Field | What to Write |
| :--- | :--- |
| **Title** | Use React Context for Global State Management |
| **Date** | 03/24/2026 |
| **Status** | Decided |
| **Context** | Share user and authentication state across the application tree efficiently. |
| **Options Considered** | 1. Redux Toolkit, 2. Zustand, 3. React Context API |
| **Decision** | **React Context API** - Built-in, lightweight, and sufficient for the current scale of state complexity. |
| **Consequences** | Zero extra dependencies, clean implementation for Auth/Profile state. |
