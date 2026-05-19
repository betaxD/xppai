---
name: xppai-report
description: Use when the user asks to generate AX 2009 analysis reports in markdown, especially change reports, session resume reports, or technical reports. Produces standardized output using XppAI report templates consistent with existing project report layout.
---

# XppAI Report

Generate one of three standardized report types:

1. `change-report`
2. `session-resume`
3. `technical-report`

Always use `scripts/generate_report.py` to build the first draft from the standard templates, then adjust details only if the user requested additional sections.

## Inputs Required

- `report_type`: one of `change-report`, `session-resume`, `technical-report`
- `title`: report title
- `date`: `DD/MM/YYYY` or `YYYY-MM-DD` (preserve user format when provided)
- `context`: concise scope line
- `source_artifact`: path or artifact identifier
- `body_path`: path to a UTF-8 markdown snippet with section content

## Command

```powershell
python skills/xppai-report/scripts/generate_report.py `
  --report-type <change-report|session-resume|technical-report> `
  --title "<report title>" `
  --date "<date>" `
  --context "<scope/context>" `
  --source-artifact "<artifact>" `
  --body-path "<path-to-body-md>" `
  --output "<output-report.md>"
```

## Report Type Rules

### 1) `change-report`

Use for technical change documentation. This now maps to the `Technical Change Report` template. Include:

- Source XPO
- Summary
- Modified Objects
- Why It Was Changed
- Expected Performance Gain
- Why Business Behavior Is Preserved
- Validation Plan

### 2) `session-resume`

Use for session outcome, implementation result, or handoff summaries. This now maps to the `Results Report` template. Include:

- Initial problem statement
- Profiler/trace analysis summary
- Artifacts reviewed
- Changes applied
- Risks and re-check list
- Files touched
- Recommended validation plan
- Suggested next fixes

### 3) `technical-report`

Use for analysis-focused diagnosis before implementation. This now maps to the `Scenario Analysis Report` template. Include:

- Identified problem
- Root cause analysis
- Business impact
- Proposed solutions
- Risk/benefit/effort comparison
- Recommendation
- Action plan
- Next steps

## Output Standards

- Markdown only
- Headings and section ordering must follow templates in `references/templates.md`
- Keep language objective and audit-friendly
- Preserve AX 2009 naming and object/method names exactly
- Do not invent metrics; if unknown, state assumption explicitly
