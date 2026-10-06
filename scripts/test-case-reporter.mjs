// Custom node:test reporter: renders every "TC-<n>: ..." test as a row in a
// Markdown table, for the GitHub Actions job summary.
export default async function* testCaseReporter(source) {
  const rows = [];
  for await (const { type, data } of source) {
    if (type !== 'test:pass' && type !== 'test:fail') continue;
    const match = /^TC-(\d+):\s*(.*)$/.exec(data.name);
    if (!match) continue;
    let result = '✅ Pass';
    if (type === 'test:fail') {
      const error = data.details?.error;
      const reason = String(error?.cause?.message ?? error?.message ?? 'failed').split('\n')[0];
      result = `❌ Fail: ${reason}`;
    }
    rows.push({ n: Number(match[1]), name: match[2], result });
  }

  rows.sort((a, b) => a.n - b.n);
  yield '## Onboarding scam-risk test cases\n\n';
  yield '| # | Test | Result |\n|---|---|---|\n';
  for (const { n, name, result } of rows) yield `| ${n} | ${name} | ${result.replaceAll('|', '\\|')} |\n`;
  yield '\n';
}
