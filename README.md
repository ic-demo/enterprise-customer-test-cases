# Enterprise customer test cases

Scam-risk test cases for REQ-0012 ("Flag customers at high scam risk from
onboarding attributes"). The **Onboarding Pipeline Test Workflow** runs TC-1
to TC-3 and publishes the results and the onboarding scam-risk report in its job
summary.

What the tests expect comes from [requirements/scam-risk.json](requirements/scam-risk.json),
which the requirements manager (nab-demo) updates when a deviation is signed off.

## Demo

The code deliberately labels flagged customers "very high risk" while the
requirement says "high risk", so the pipeline starts out failing.

1. Show the failing pipeline (TC-2 ❌, "Matches expected" ❌).
2. In nab-demo, sign off the deviation on REQ-0012.
3. The **Sync requirement** workflow commits the amended requirement and reruns
   the pipeline, which passes.

## Reset

Run `npm run reset` in nab-demo. It resets this repo's requirement too, and the
pipeline reruns and fails again.

If nab-demo isn't set up to notify GitHub: **Actions > Sync requirement > Run workflow**.

## Setup

One-time, in nab-demo's `.env`:

```
GITHUB_DISPATCH_REPO="ic-demo/enterprise-customer-test-cases"
GITHUB_DISPATCH_TOKEN="<fine-grained token with Contents: Read and write on this repo>"
```

Nothing needs installing here. To run the tests locally (Node 20+):
`npm test`, or `npm run demo` to rerun them whenever a file changes, and
`npm run report` for the onboarding report.
