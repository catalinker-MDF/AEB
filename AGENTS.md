
# AEB — Agent Instructions

## 1. Project Overview

AEB stands for **Analisador de Extrato Bancário**.

It is a browser-based application that allows users to upload a bank statement in PDF format, select a date range, and calculate the total amounts of money entering and leaving their bank account during that period.

The application interface must be written in **Brazilian Portuguese (pt-BR)**.

## 2. Main Objective

The primary goal is to provide a simple and reliable way to:

- Upload a bank statement in PDF format.
- Extract transaction information from the document.
- Select a start date and an end date.
- Calculate total incoming transactions (*entradas*).
- Calculate total outgoing transactions (*saídas*).
- Display the results clearly.
- Allow users to review the transactions included in the calculation.

Both dates in the selected date range must be included in the calculation.

## 3. Technology Stack

Keep the technology stack intentionally lean.

Current project setup:

- **Vite** — development server and production build tool.
- **TypeScript** — application programming language.
- **HTML** — application structure.
- **CSS** — visual presentation.
- **PDF.js** — planned library for extracting text from PDF documents.

Do not introduce a frontend framework or additional dependencies unless there is a clear technical reason.

The application must remain a static web application. Do not introduce a backend, database, or server-side document processing without explicit approval.

## 4. Architecture and Privacy

All bank statement processing must happen locally in the user's browser.

Important requirements:

- Never upload bank statements to an external server.
- Never send extracted financial information to third-party services.
- Do not store sensitive transaction data persistently unless explicitly requested.
- Keep responsibilities separated between UI components, services, types, and application entry points.

The initial version may support a single bank statement format. Design the code so that additional bank formats can be supported later without rewriting the entire application.

Other requirements, during development:

- Do not log bank statement contents or transaction data to the console.
- Use synthetic or anonymized data in examples and tests.
- Do not commit real bank statements, personal information, or sensitive financial data to the repository.
- Bundle application dependencies locally when needed; do not load PDF processing resources from third-party CDNs without explicit approval.

## 5. Project Structure

Respect the existing project organization:

```text
AEB/
├── docs/
├── public/
├── src/
│   ├── components/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── main.ts
├── index.html
├── package.json
├── package-lock.json
└── AGENTS.md
```

Use these conventions:

- `components/`: UI components and their presentation logic.
- `services/`: PDF extraction, transaction processing, calculations, and other application services.
- `types/`: shared TypeScript types and interfaces.
- `styles/`: CSS files.
- `assets/`: static assets used by the application.
- `docs/`: technical documentation and project decisions.

Avoid placing the entire application in `main.ts`. Keep it focused on application initialization and coordination.

## 6. Coding Conventions

- Use TypeScript for application logic.
- Use English for variable names, function names, types, comments, and filenames.
- Use clear and descriptive names.
- Prefer small functions with a single responsibility.
- Avoid unnecessary abstractions and dependencies.
- Use explicit types for important application data.
- Handle errors explicitly, especially during PDF reading and transaction processing.
- Keep the implementation simple and maintainable.

Do not use `any` unless there is a justified technical reason.

## 7. Financial Data and Calculations

Financial calculations must be accurate and predictable.

Pay special attention to:

- Brazilian currency formatting (`R$`).
- Brazilian number formatting, including decimal commas and thousands separators.
- Correct identification of incoming and outgoing transactions.
- Transaction dates and date-range boundaries.
- Duplicate transactions.
- Missing or malformed values.

Do not automatically remove transactions solely because their dates, descriptions, or amounts match. Flag possible duplicates for user review unless a bank-specific rule can reliably identify them.

Avoid floating-point arithmetic errors in monetary calculations. Represent monetary amounts as integer cents and validate them before calculation.

Treat transaction dates as calendar dates, without timezone conversion. Validate that the start date is not after the end date.
Include both boundary dates in the selected range.

If transaction data cannot be reliably extracted, interpreted, or classified, clearly warn the user that the results may be incomplete or inaccurate.
Do not present uncertain totals as definitive.
When possible, show the affected items for review.

## 8. PDF Processing

The initial PDF implementation should use PDF.js to extract text directly in the browser.

Consider the following limitations:

- The first version should focus on text-based PDF statements.
- Scanned or image-only PDFs are not necessarily readable through ordinary text extraction.
- OCR may be considered in a future version, but must not be introduced without approval.

Keep PDF extraction separate from transaction interpretation. The extracted text should be processed by a dedicated service responsible for identifying and normalizing transactions.

## 9. User Interface

The application name is **AEB**.

The full interface title is:

**Analisador de Extrato Bancário**

All visible application text must be in Brazilian Portuguese.

Prioritize:

- Clarity.
- Simplicity.
- Readability.
- Responsive layout.
- Clear error messages.
- Accessible form controls.
- Consistent currency and date formatting.

Do not add visual complexity that does not improve the user's workflow.

## 10. Development and Validation

Use the existing npm scripts and local project dependencies.

Before considering a change complete:

1. Check for TypeScript errors.
2. Run the production build.
3. Fix any errors introduced by the change.
4. Summarize the files changed and the reason for each change.

Use:

```bash
npm run dev
```

to start the local development server.

Use:

```bash
npm run build
```

to generate the production build.

The `build` script currently runs `tsc` before `vite build`, so it
checks TypeScript types before generating the production build.
If the build script or TypeScript configuration changes, ensure that type checking remains part of the validation process.

The production output must be suitable for deployment to ordinary shared hosting as static files.

Add automated tests for financial calculations and bank-specific parsing rules as those features are implemented.
Cover date boundaries, monetary parsing, malformed data, and possible duplicate transactions.
Use synthetic test data. Explain any new testing dependency before adding it.

## 11. Working with Codex

Before modifying the project:

- Read this file.
- Inspect the relevant existing files.
- Understand the current implementation before proposing changes.

When implementing a feature:

- Explain the intended approach briefly.
- Prefer small, incremental changes.
- Do not rewrite unrelated parts of the application.
- Do not install new dependencies without explaining why they are needed.
- Do not introduce new architectural decisions without discussing their impact.

When requirements are ambiguous, ask before making assumptions that could affect the architecture or financial calculations.

Keep documentation consistent with the actual implementation.

