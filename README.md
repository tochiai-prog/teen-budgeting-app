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
- Server-side validation of spending amount, date, and category (SEC-18) is not implemented in this task and is planned separately.
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
| SEC-5 | Not at all | There is no backend API or session system yet, so unauthenticated request handling is not implemented. |
| SEC-6 | Not at all | There is no sign-in flow, so there is no consistent failed-login message behavior. |
| SEC-7 | Not at all | There is no user-owned data model or backend access layer to enforce per-user authorization. |
| SEC-8 | Not at all | No user data records or backend routes exist yet, so cross-user access control is not implemented. |
| SEC-9 | Not at all | There is no sharing model, consent flow, or parent/teacher access mechanism in the current demo. |
| SEC-10 | Fully | The onboarding flow asks for a birth date before continuing, matching the age-gate requirement. |
| SEC-11 | Fully | Users under 13 are blocked from the app and no blocked-attempt tracking is kept in this first build. |
| SEC-12 | Fully | There is no paid checkout in the prototype, so the minor-purchase policy is effectively not triggered. |
| SEC-13 | Partly | HTTPS is provided by Vercel in production, but this local prototype does not explicitly enforce HTTPS in its own code or local run configuration. |
| SEC-14 | Partly | The prototype collects a display name, age, and spending entries; budgets, goals, and lesson progress are not implemented. |
| SEC-15 | Fully | Deleting an entry removes it from the user's visible history and recalculates the overall total. |
| SEC-16 | Not at all | The prototype has no account-deletion flow or retention-period notice. |
| SEC-17 | Fully | The current demo does not log user financial data, age data, or session tokens, and there are no user session tokens in this prototype. |
| SEC-18 | Not at all | Server-side validation of amount, date, and category is not implemented; it is planned as a separate task. |
| SEC-19 | Partly | Merchant and note values are rendered as text by React; other user-generated fields such as goal names are not implemented. |
| SEC-20 | Partly | The server computes the overall spending total; budgets, remaining amounts, and limit comparisons are not implemented. |
| SEC-21 | Not at all | There is no public API or write endpoint to enforce a per-minute request throttle. |
| SEC-22 | Fully | No AI feature is present in the current prototype, so the prompt-length and rate-limit rule is not triggered. |
| SEC-23 | Fully | This work is scoped to demo/in-memory data only and no production credentials or secrets are included in the project. |
| SEC-24 | Fully | The work stayed within the project, did not rewrite git history, and did not change infrastructure or external systems. |
