

# Contributing to Syllabus Curriculum Map

Thank you for contributing to our Knowledge Management project! To maintain a clean and professional codebase, please follow these guidelines.

## 1. Getting Started (Clone & Run)
Follow these steps to get your local environment set up:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/[your-repo-path].git
    cd [repo-folder-name]
    ```
2.  **Install Dependencies:**
    We use `npm` for package management.
    ```bash
    npm install
    ```
3.  **Run the Project:**
    To start the development server:
    ```bash
    npm run dev
    ```
4.  **Running Tests:**
    Before pushing your changes, ensure all tests pass:
    ```bash
    npm run test
    ```

## 2. Branch Naming Conventions
Every member must work on their own feature branch. **Never commit directly to `main` or `dev`**. 
**Format:** `[role]/[short-description]`

* **Roles:** `dev`, `ux`, `km`, `qa`
* **Examples:** * `dev/authentication-fix`
    * `qa/sprint1-tests`
    * `km/taxonomy-schema`

## 3. Commit Message Standards
We follow a structured format to ensure our **automated changelog** remains readable.
**Format:** `[type]: [Description] — [Rationale]`

* **Allowed Types:**
    * `feat`: A new feature
    * `fix`: A bug fix
    * `docs`: Documentation changes
    * `test`: Adding or correcting tests
    * `refactor`: Code changes that neither fix a bug nor add a feature
* **Example:** `test: add login validation — ensures Google OAuth security compliance`.

## 4. Pull Request (PR) Process
1.  **Sync First:** Before opening a PR, rebase your branch onto the latest `dev` branch.
2.  **Target Branch:** All feature PRs should target the `dev` branch, **not** `main`.
3.  **Description:** Use the PR template to describe:
    * What was added/changed.
    * How to test the changes.
    * Screenshot/Video of UI changes (if applicable).
4.  **One PR per Sprint:** Each member must contribute at least one PR per sprint.

## 5. Code Review Expectations
Before a PR is merged by the **Project Manager** or **Lead Developer**, it must meet these criteria:
* **Functionality:** Does the code actually do what it claims?
* **Readability:** Is the code clean and well-commented?
* **Security:** No API keys, secrets, or hardcoded passwords.
* **Alignment:** Does it match the **UX Wireframes** and **KM Architecture**?
* **Approval:** At least one "Approve" vote is required from a peer or lead.

---
