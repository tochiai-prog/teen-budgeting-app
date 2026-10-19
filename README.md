# Teen Budgeting App

Prototype for a budgeting and financial-literacy app for teens ages 13-19.

## Current scope

- age-gated onboarding flow
- display name / nickname step
- educational-use confirmation step
- manually entered spending entries with add, edit, and delete
- an overall spending total displayed in US dollars
- fixed categories: Rides, Shopping, Food delivery, Entertainment, and Other
- spending entries stored in server memory only; data resets when the server restarts or the app is redeployed
- no real authentication, payment, or banking integration

## Prototype limitations and non-goals

- Spending is typed in by the user; the app does not connect to merchants or bank accounts.
- A typed display name identifies entries instead of a real account. Anyone who enters the same name can see and change those entries.
- Entries are not saved to a database and may be lost when the server restarts or the app is redeployed.
- Spending entry amount, date, category, merchant, and note are validated by the server on create and edit (SEC-18).
- Real authentication, payments, bank connections, and custom categories are not included.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in the browser.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Security spec audit

| Requirement | Status | Why |
| --- | --- | --- |
| SEC-1 | Partly | No secret values are committed to the repo, but there is no `.env.example` or environment variable setup documented for future credentials. |
| SEC-2 | Not at all | The app has no secret-loading pattern or `.env.local` guidance yet, so secrets are not handled explicitly. |
| SEC-3 | Not at all | There is no `.env.example` file listing required variables for this prototype. |
| SEC-4 | Not at all | The current build uses a typed display name as a stand-in identity, which is explicitly not a real sign-in provider or password system. |
| SEC-5 | Not at all | The entries API exists, but requests identify the data using a caller-supplied display name; there is no valid-session check or 401 response for unauthenticated requests. |
| SEC-6 | Not at all | There is no sign-in flow, so there is no consistent failed-login message behavior. |
| SEC-7 | Not at all | The entries API filters in-memory data by a caller-supplied display name, not by an authenticated user's id, so it does not enforce user ownership. |
| SEC-8 | Partly | The entry API returns 404 when an id is absent from the selected display name's entries, including when that id belongs to another name, but caller-supplied names are not authenticated and do not provide real ownership checks. |
| SEC-9 | Not at all | There is no sharing model, consent flow, or parent/teacher access mechanism in the current demo. |
| SEC-10 | Fully | The onboarding flow asks for a birth date before continuing, matching the age-gate requirement. |
| SEC-11 | Fully | Users under 13 are blocked from the app and no blocked-attempt tracking is kept in this first build. |
| SEC-12 | Fully | There is no paid checkout in the prototype, so the minor-purchase policy is effectively not triggered. |
| SEC-13 | Partly | HTTPS is provided by Vercel in production, but this local prototype does not explicitly enforce HTTPS in its own code or local run configuration. |
| SEC-14 | Partly | The prototype collects a display name, age, and spending entries; budgets, goals, and lesson progress are not implemented. |
| SEC-15 | Fully | Deleting an entry removes it from the user's visible history and recalculates the overall total. |
| SEC-16 | Not at all | The prototype has no account-deletion flow or retention-period notice. |
| SEC-17 | Fully | The current demo does not log user financial data, age data, or session tokens, and there are no user session tokens in this prototype. |
| SEC-18 | Fully | Server-side create tests cover amount 0, 0.01, 100,000, 100,000.01, negative, and text values; today, tomorrow, and an invalid calendar date; allowed and disallowed categories; and note lengths of 200 and 201 characters. Merchant lengths of 200 and 201 are covered too, and edits are validated. Broader protections are still missing: there is no real sign-in or ownership check, so anyone who types the same display name can view or change those entries; entries are in memory only and are lost on restart. |
| SEC-19 | Partly | Merchant and note values are rendered as text by React; other user-generated fields such as goal names are not implemented. |
| SEC-20 | Partly | The server computes the overall spending total; budgets, remaining amounts, and limit comparisons are not implemented. |
| SEC-21 | Not at all | Write endpoints exist for creating, editing, and deleting entries, but they do not throttle more than 60 write requests per minute per address. |
| SEC-22 | Fully | No AI feature is present in the current prototype, so the prompt-length and rate-limit rule is not triggered. |
| SEC-23 | Fully | This work is scoped to demo/in-memory data only and no production credentials or secrets are included in the project. |
| SEC-24 | Fully | The work stayed within the project, did not rewrite git history, and did not change infrastructure or external systems. |
