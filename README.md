# Enterprise customer test cases

Scam-risk test cases for REQ-0012 ("Flag customers at high scam risk from
onboarding attributes"). Two GitHub Actions workflows run them and publish the
results in their job summaries:

- **Onboarding Pipeline Test Workflow**: TC-1 to TC-3 and the onboarding scam-risk report
- **Customer Login Risk Tests**: login tests and the scam-risk flagging report

What the tests expect comes from [requirements/scam-risk.json](requirements/scam-risk.json),
which the requirements manager (nab-demo) updates when a deviation is signed off.

## Demo

The code deliberately labels flagged customers "very high risk" while the
requirement says "high risk", so both workflows start out failing.

1. Show the failing workflows (TC-2 ❌, "Matches expected" ❌).
2. In nab-demo, sign off the deviation on REQ-0012.
3. The **Sync requirement** workflow commits the amended requirement and reruns
   both workflows, which pass.

## Reset

Run `npm run reset` in nab-demo. It resets this repo's requirement too, and the
workflows rerun and fail again.

If nab-demo isn't set up to notify GitHub: **Actions > Sync requirement > Run workflow**.

## Setup

One-time, in nab-demo's `.env`:

```
GITHUB_DISPATCH_REPO="ic-demo/enterprise-customer-test-cases"
GITHUB_DISPATCH_TOKEN="<fine-grained token with Contents: Read and write on this repo>"
```

Nothing needs installing here. To run the tests locally (Node 20+):
`npm test`, or `npm run demo` to rerun them whenever a file changes.
