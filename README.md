# Knowledge Mapping App

This application visualizes academic program connections, including course prerequisites, skills, and knowledge progression. Below are the technical stack considerations detailing what technologies are used, their purpose, and why they were chosen for this specific application.

## Tech Stack Considerations

### Frontend Framework: React (v19)
* **Purpose:** Core library for building the user interface.
* **Why it's used:** React provides a robust component-based architecture which is ideal for a complex mapping and visualization tool. It allows for reusable UI elements (like course nodes and connections), efficient rendering of dynamic content, and has a vast ecosystem of libraries that map nicely to our requirements (like visualization and routing).

### Build Tool & Dev Server: Vite (v8)
* **Purpose:** Serves the app locally during development and bundles it for production.
* **Why it's used:** Vite is incredibly fast compared to traditional bundlers like Webpack. It provides an instant startup time and lightning-fast Hot Module Replacement (HMR). This significantly improves the developer experience and shortens the feedback loop when tweaking UI components or visualization logic.

### Programming Language: TypeScript
* **Purpose:** Adds static typing to pure JavaScript.
* **Why it's used:** In an application tracking complex data models (like nodes, edges, curricula, and user roles), TypeScript helps prevent runtime errors by enforcing strict data structures. It vastly improves code maintainability, refactoring confidence, and editor autocompletion.

### Styling: Tailwind CSS (v4)
* **Purpose:** Utility-first CSS framework for styling the application.
* **Why it's used:** Tailwind allows for rapid UI development by applying utility classes directly to HTML/JSX elements. It enforces a consistent design system (colors, spacing, typography) out of the box and prevents bloated, hard-to-maintain custom CSS files, making it easier to keep the design cohesive across the entire platform.

### Routing: React Router DOM (v7)
* **Purpose:** Handles client-side navigation.
* **Why it's used:** It is the industry standard for React applications to manage navigation between different views (e.g., dashboard, curriculum maps, user profiles, settings) without triggering full page reloads. This provides a smooth, fast, app-like user experience.

### Backend & Database: Supabase
* **Purpose:** Backend-as-a-Service providing a PostgreSQL database, authentication, and API layer.
* **Why it's used:** Supabase provides a full relational PostgreSQL database which is perfectly suited for the deeply relational nature of a Knowledge Map (e.g., courses relating to skills, handling multiple pre-requisites). It also provides out-of-the-box user authentication and row-level security (RLS), allowing us to efficiently manage access controls for Students, Faculty, and Admins without needing to build and maintain a custom backend server from scratch.

## Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
