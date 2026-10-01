# TEST_SPEC.md: Teen Budgeting App

Companion to `requirements.md` and `SECURITY_SPEC.md`. Every acceptance criterion and every SEC rule maps to at least one named test. The test runner is Vitest (`npm test`).

## 1. Principles

1. Every requirement is proven by a test.
2. Tests come first: write the failing test, run it, confirm it fails, then write code until it passes.
3. Tests change only when the spec changes.
4. The suite is fast, free, and repeatable: no network calls, no real users, no real money.

## 2. What the harness must cover

### 2.1 Unit tests (business rules)

- **TEST-1** Totals by category and period SHALL be tested with: no entries (empty state, no invented total), one entry, several entries across two categories, and entries on the boundary dates of a period.
- **TEST-2** Limits and goals SHALL be tested at: under the limit, exactly at the limit, one cent over (alert shown, neutral wording), and a goal fully reached.
- **TEST-3** Input validation SHALL be tested for amount (0, 0.01, 100,000, 100,000.01, negative, text), date (today, tomorrow, invalid), category (allowed, not allowed), and note length (200, 201 characters).
- **TEST-4** Age gating SHALL be tested at 12, 13, 17, 18, 19, and 20.

### 2.2 API tests

- **TEST-5** Every API route SHALL have tests for the success case, no session (401), someone else's record (404), and bad input (422).

### 2.3 Security tests (one per SEC rule that today's build claims to meet)

- **TEST-6** `someone else cannot see my spending entry` (SEC-8)
- **TEST-7** `an under-13 cannot create an account` (SEC-11)
- **TEST-8** `a negative amount is rejected by the server` (SEC-18)
- **TEST-9** `the server ignores a total sent by the browser` (SEC-20)
- **TEST-10** `the 61st write in a minute gets 429` (SEC-21)
- **TEST-11** `a note containing a script tag is shown as text` (SEC-19)

### 2.4 End-to-end (if time allows)

- **TEST-12** One browser journey: create a display name, add three entries, open the summary, set a limit, exceed it, see the neutral alert, delete an entry, see totals recalculate.

## 3. Test data and isolation

- **TEST-13** Tests SHALL use fake users (`maya`, `jordan`) and fixture entries. No real spending data.
- **TEST-14** Each test SHALL create and clean up its own data so tests run in any order.

## 4. Rules for the coding agent

```
- For every task: write the failing test first, run it, confirm it fails, then write code until it passes.
- Never delete, skip, disable, or weaken a test to make the suite pass.
- Always run npm test and npm run build before saying a task is done, and paste the real summary lines.
- If a test and the spec disagree, stop and ask a human which is right.
- Name tests as plain-English sentences, e.g. test("someone else cannot see my spending entry").
```

## 5. Traceability matrix

| Requirement | Source | Test name | Type | Status |
| --- | --- | --- | --- | --- |
| R-01 age gate | requirements.md | `an under-13 cannot create an account` | Unit + API | [ ] |
| R-02 private account | requirements.md | `someone else cannot see my spending entry` | Security | [ ] |
| R-05 add entry | requirements.md | `a saved entry appears in history` | API | [ ] |
| R-05 edit or delete | requirements.md | `deleting an entry updates the totals` | Unit | [ ] |
| R-06 empty period | requirements.md | `an empty period shows an empty state, not a total` | Unit | [ ] |
| R-07 over limit | requirements.md | `one cent over the limit shows a neutral alert` | Unit | [ ] |
| R-11 save failure | requirements.md | `a failed save leaves totals unchanged` | API | [ ] |
| SEC-18 | SECURITY_SPEC.md | `a negative amount is rejected by the server` | Security | [ ] |
| SEC-20 | SECURITY_SPEC.md | `the server ignores a total sent by the browser` | Security | [ ] |
| SEC-21 | SECURITY_SPEC.md | `the 61st write in a minute gets 429` | Security | [ ] |

## 6. Definition of done

- [ ] Every acceptance criterion touched by the change has a passing test
- [ ] Every SEC rule the build claims to meet has a passing test
- [ ] `npm test` and `npm run build` are green; no tests skipped or deleted
- [ ] A human read the test names against the spec
- [ ] README lists what is not built (non-goals) and the security spec audit
