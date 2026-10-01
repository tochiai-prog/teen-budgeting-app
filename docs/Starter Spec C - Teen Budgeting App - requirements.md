# Requirements Specification: Teen Budgeting App

## Product summary

An app for teenagers ages 13–19 to learn financial planning and budgeting through short lessons, practice exercises, and a personal budget. Users can record spending such as Uber, Amazon, and Uber Eats/DoorDash purchases, see where their money goes, and set savings goals. The app supports accounts and may offer paid features. Privacy is the primary concern.

## User stories and EARS acceptance criteria

**R-01 — Age-appropriate access.** As a teenager, I want an experience suited to my age so I can learn without encountering inappropriate features.
- WHEN a new user creates an account, THE app SHALL ask for their age or birth date and allow the teen experience only for users aged 13–19.
- IF the user indicates they are under 13, THEN THE app SHALL stop account creation without collecting spending entries.

**R-02 — Private account.** As a user, I want my budget to stay private so other users cannot see my spending.
- WHEN a user signs in, THE app SHALL show only that user's own lessons, spending entries, budgets, and goals.
- IF a user is not authenticated, THEN THE app SHALL deny access to saved personal data.

**R-03 — Financial lessons.** As a user, I want clear lessons on budgeting, saving, debt, and investing so I can build basic financial knowledge.
- WHEN a user chooses a topic, THE app SHALL present a short lesson with an age-appropriate example and a knowledge check.
- WHEN a user completes a knowledge check, THE app SHALL show the result and an explanation of each answer.

**R-04 — Practice mode.** As a user, I want to try budgeting with fictional money so I can learn without risking real money.
- WHEN a user starts a practice exercise, THE app SHALL label all balances and transactions as simulated and show the effect of the user's choices on a sample budget.

**R-05 — Spending entries.** As a user, I want to record my real spending so I can understand my habits.
- WHEN a user adds an entry, THE app SHALL accept an amount, date, category, and optional merchant or note, and SHALL display the saved entry in their history.
- WHEN a user edits or deletes their own entry, THE app SHALL update the budget totals accordingly.

**R-06 — Categories and insights.** As a user, I want to see how much I spend on things like rides, shopping, and food delivery so I know where my money goes.
- WHEN a user opens the spending summary, THE app SHALL show totals by category and time period using only that user's entries.
- IF a period contains no entries, THEN THE app SHALL show an empty state rather than inventing a total or insight.

**R-07 — Budget and goals.** As a user, I want to set spending limits and savings goals so I can plan ahead.
- WHEN a user sets a category limit or savings goal, THE app SHALL show the target, current progress, and remaining amount, calculated from the applicable entries.
- IF recorded spending exceeds a limit, THEN THE app SHALL show a neutral alert without shaming the user.

**R-08 — Clear educational boundaries.** As a user, I want to distinguish general education from recommendations about my own finances.
- WHEN the app discusses debt, investing, or spending decisions, THE app SHALL identify the material as general education and avoid personalized product or investment recommendations.
- IF an example uses simulated values, THEN THE app SHALL label those values as examples.

**R-09 — Privacy controls.** As a user, I want control over my financial information.
- WHEN a user opens privacy settings, THE app SHALL explain what account and spending data it keeps and who can access it.
- WHEN a user requests deletion of an entry, THE app SHALL remove it from the user-facing account and recalculate summaries.
- WHEN a user requests account deletion, THE app SHALL initiate deletion of their account and associated spending data and clearly state any applicable retention period.

**R-10 — Paid features.** As a prospective customer, I want to understand a charge before paying.
- IF paid features are offered, THEN THE app SHALL show the price, billing frequency, included features, and cancellation terms before a purchase is confirmed.
- IF the user is under 18, THEN THE app SHALL block checkout until an approved minor-purchase policy and flow are defined.

**R-11 — Errors and recovery.** As a user, I want to know when data was not saved so I do not rely on an incorrect budget.
- IF saving an entry fails, THEN THE app SHALL state that it was not saved and SHALL leave the displayed totals unchanged.
- IF a calculation cannot be completed, THEN THE app SHALL show an error instead of a misleading result.

## Non-goals for the first release

- Moving money, issuing cards, lending, or placing investments.
- Connecting directly to bank, Uber, Amazon, or food-delivery accounts.
- Sharing individual spending with parents, teachers, advertisers, or other users.
- Personalized financial advice or promises about financial outcomes.

## Assumptions and open decisions

These are **assumptions**, not details supplied by the requester:

1. Spending is entered manually; the named merchants are examples, not integrated data sources.
2. A user's spending is private by default. Parent or teacher access is deferred until its permissions and consent rules are specified.
3. The initial release uses a fictional-money practice mode alongside user-entered real spending; it never holds or transfers funds.
4. The business model is undecided: “yes” to possible monetization does not determine whether it will use subscriptions, ads, or one-time purchases. No checkout launches until pricing and the policy for minors are resolved.
5. The launch jurisdiction, age-verification method, retention period, and any required parental process remain undecided and need review before release.
6. Account deletion initiates removal, but exact backup and legal retention timing needs a documented policy before launch.

## Source notes

The FTC describes COPPA as applying to services directed to children under 13 or with actual knowledge that they collect personal information from children under 13: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa . This draft targets ages 13–19 and does not substitute for jurisdiction-specific legal review.
