# SECURITY_SPEC.md: Teen Budgeting App

Companion to `requirements.md` (Teen Budgeting App). Every requirement is in EARS so it can become a test. IDs are referenced by name in `TEST_SPEC.md`.

## 0. Context

- **Product:** a budgeting and financial-literacy app for teenagers aged 13 to 19 who record their own spending, set limits and goals, and work through short lessons.
- **What we are protecting:** each user's spending entries, budgets, goals, age, and account identity. Users are minors, so exposure is both a privacy harm and a legal one.
- **Who might attack or misuse it:** another user guessing IDs to read someone else's budget; scripts hammering the API; an advertiser or data broker; a careless coding agent with too much access.
- **Compliance that applies:** COPPA for under-13 users (the app refuses them); state privacy laws for minors; no payment data is ever handled by the app itself.

## 1. Secrets

- **SEC-1** THE SYSTEM SHALL NOT include any API key, database password, or signing secret in source code, the repository, or any file sent to the browser.
- **SEC-2** THE SYSTEM SHALL load secrets from environment variables locally (`.env.local`, listed in `.gitignore`) and from the hosting platform's settings in production.
- **SEC-3** THE repository SHALL provide a `.env.example` listing every required variable name with empty values.

## 2. Authentication

- **SEC-4** THE SYSTEM SHALL use a proven identity provider for sign-in and SHALL NOT store passwords itself. (Today's lab: a typed display name stands in for sign-in and this requirement is recorded as not met.)
- **SEC-5** WHEN a request has no valid session, THE API SHALL return 401 and no personal data.
- **SEC-6** WHEN sign-in fails, THE SYSTEM SHALL show the same message whether the account does not exist or the credential is wrong.

## 3. Authorization

- **SEC-7** THE backend SHALL filter every read and write of entries, budgets, goals, and lesson progress by the signed-in user's id, never by an id supplied in the request alone.
- **SEC-8** IF a user requests an entry, budget, or goal they do not own, THEN THE API SHALL return 404, the same response as a record that does not exist.
- **SEC-9** THE SYSTEM SHALL NOT expose any user's spending to parents, teachers, advertisers, or other users unless a consent flow for that sharing has been specified and built.

## 4. Age and minors

- **SEC-10** WHEN a new account is created, THE SYSTEM SHALL collect an age or birth date before any other personal data.
- **SEC-11** IF the stated age is under 13, THEN THE SYSTEM SHALL stop account creation and SHALL NOT store the attempt beyond an anonymous count.
- **SEC-12** IF the user is under 18, THEN THE SYSTEM SHALL block any paid-feature checkout until a minor-purchase policy exists.

## 5. Data protection

- **SEC-13** THE SYSTEM SHALL use HTTPS for all traffic.
- **SEC-14** THE SYSTEM SHALL collect only: display name, age or birth date, spending entries (amount, date, category, optional merchant or note), budgets, goals, and lesson progress. Anything else requires a change to this spec.
- **SEC-15** WHEN a user deletes an entry, THE SYSTEM SHALL remove it from every user-facing view and recalculate totals.
- **SEC-16** WHEN a user requests account deletion, THE SYSTEM SHALL delete the account and all associated spending data within 30 days and tell the user the retention period.
- **SEC-17** THE SYSTEM SHALL NOT write spending entries, ages, or session tokens to logs.

## 6. Input and output

- **SEC-18** THE backend SHALL validate every input on the server: amount is a number between 0.01 and 100,000; date is a valid calendar date not in the future; category is one of the allowed list; merchant and note are at most 200 characters.
- **SEC-19** THE frontend SHALL render all user-supplied text (merchant, note, goal name) as text, never as HTML.
- **SEC-20** THE backend SHALL compute every total, remaining amount, and limit comparison itself and SHALL ignore totals sent by the client.

## 7. Abuse and cost controls

- **SEC-21** IF one address makes more than 60 write requests in one minute, THEN THE API SHALL return 429.
- **SEC-22** WHERE any AI feature exists (for example a lesson explainer), THE API SHALL cap prompt length at 2,000 characters and SHALL rate limit it at 20 requests per minute per address.

## 8. The coding agent

- **SEC-23** WHILE working in development, THE coding agent SHALL use only in-memory or development data and SHALL NOT hold production credentials.
- **SEC-24** IF a command would delete files outside the project, rewrite git history, or change infrastructure, THEN THE coding agent SHALL stop and ask a human.

## 9. Traceability

| Requirement | Test name | Status |
| --- | --- | --- |
| SEC-8 | `someone else cannot see my spending entry` | [ ] |
| SEC-11 | `an under-13 cannot create an account` | [ ] |
| SEC-18 | `a negative amount is rejected by the server` | [ ] |
| SEC-20 | `the server ignores a total sent by the browser` | [ ] |
| SEC-21 | `the 61st write in a minute gets 429` | [ ] |
