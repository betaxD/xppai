#!/usr/bin/env python3
import argparse
from pathlib import Path


def read_body(body_path: str) -> str:
    body = Path(body_path).read_text(encoding="utf-8").strip()
    if not body:
        return "_No additional notes provided._"
    return body


def build_scenario_analysis_report(title: str, date: str, context: str, source_artifact: str, body: str) -> str:
    return f"""# Scenario Analysis Report
**Tuning Project:** {title}
**Date:** {date}
**Author(s):** XppAI
**Phase:** Analysis

---

## 1. Identified Problem
Describe the detected performance or functionality issue.

### Current request notes
- **Scope/context:** {context or "_Not specified_"}
- **Source artifact:** `{source_artifact}`

### Analyst working draft
{body}

---

## 2. Root Cause Analysis
Explain what is causing the problem.

### Include
- **Technical bottleneck:** [repeated queries, inefficient processing, unnecessary calls, etc.]
- **Why it happens:** [code flow, architecture, dependencies]
- **Evidence and metrics:** [timings, round trips, CPU, logs]

---

## 3. Business Impact
Translate the technical issue into business terms.

- **Productivity loss:** [X hours lost per user/day]
- **Operational cost:** [infrastructure, support, rework]
- **Risks:** [downtime, system errors, user frustration]

---

## 4. Proposed Solutions

| Solution | Description | Expected Benefit | Risks |
|----------|-------------|------------------|-------|
| [Solution 1] | [Short explanation] | [Estimated improvement] | [Low/Medium/High] |
| [Solution 2] | [Short explanation] | [Estimated improvement] | [Low/Medium/High] |

---

## 5. Risk × Benefit × Effort Matrix

| Solution | Risk | Benefit | Effort (days) |
|----------|------|---------|---------------|
| [Solution 1] | [Low/Medium/High] | [Low/Medium/High] | [3-5] |
| [Solution 2] | [Low/Medium/High] | [Low/Medium/High] | [3-5] |

---

## 6. Recommendation
State which solution is recommended and why.

### Include
- **Comparative analysis of options**
- **Selection rationale**
- **Estimated timeline**
- **Dependencies**

---

## 7. Action Plan

| Phase | Activity | Owner | Duration | Status |
|-------|----------|-------|----------|--------|
| 1 | [Task] | [Name] | [X days] | Planned |
| 2 | [Task] | [Name] | [X days] | Planned |

---

## 8. Next Steps
- [ ] Approve proposed solution
- [ ] Allocate resources
- [ ] Start implementation
"""


def build_results_report(title: str, date: str, context: str, source_artifact: str, body: str) -> str:
    return f"""# Results Report
**Tuning Project:** {title}
**Date:** {date}
**Period:** {date}
**Status:** Draft

---

## 1. Executive Summary
Summarize the achieved results and the most relevant improvement figures.

### Current request notes
- **Scope/context:** {context or "_Not specified_"}
- **Source artifact:** `{source_artifact}`

### Analyst working draft
{body}

---

## 2. Implemented Changes

| Component | Change | Rationale | Impact |
|-----------|--------|-----------|--------|
| [Method/Form] | [Implemented change] | [Why] | [High/Medium/Low] |
| [Method/Form] | [Implemented change] | [Why] | [High/Medium/Low] |

---

## 3. Quantified Gains

| Metric | Before | After | Improvement % |
|--------|--------|-------|---------------|
| Load Time | [value] | [value] | [%] |
| Queries per Navigation | [value] | [value] | [%] |
| CPU Usage | [value] | [value] | [%] |
| Response Time | [value] | [value] | [%] |

---

## 4. Business Impact
1. **Productivity increase:** [X hours saved per user/day]
2. **Cost reduction:** [Estimated infrastructure savings]
3. **Experience improvement:** [user feedback]

---

## 5. Proposed Test Scenarios

### 5.1 Functional Tests
1. **Scenario 1:** [description - expected outcome]
2. **Scenario 2:** [description - expected outcome]
3. **Scenario 3:** [description - expected outcome]

### 5.2 Performance Tests
1. **Test with X rows:** [verify response < Y seconds]
2. **Test with Y concurrent users:** [verify stability]
3. **Regression test:** [verify existing features]

---

## 6. Residual Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | [Low/Medium/High] | [Low/Medium/High] | [Action] |
| [Risk] | [Low/Medium/High] | [Low/Medium/High] | [Action] |

---

## 7. Future Recommendations
1. Continuous performance monitoring
2. Potential future improvements: [list]
3. Keep code documentation updated
"""


def build_technical_change_report(title: str, date: str, source_artifact: str, body: str) -> str:
    return f"""# Technical Change Report
**Tuning Project:** {title}
**Date:** {date}
**Author(s):** XppAI
**Target Version:** AX 2009

---

## 1. Objective
Briefly describe what was improved and why.

### Current request notes
- **Source artifact:** `{source_artifact}`

### Analyst working draft
{body}

---

## 2. Technical Problem

### 2.1 Symptoms
Describe:
- What was being repeated?
- What was the cost?
- What was the observed technical impact?

### 2.2 Root Cause
Describe:
- Why did the problem occur?
- Which code flow is responsible?
- Which dependencies or calls were involved?

---

## 3. Implemented Changes

| Module/Form | Method/Field | Change | Type |
|-------------|--------------|--------|------|
| [SalesTable] | [refresh()] | [Condition added] | PERF |
| [Class/Form] | [Method] | [Change] | BUG/PERF/REFACTOR |

---

## 4. Technical Details per Change

### 4.1 Change 1: [TITLE]
**Type:** PERF (Performance) / BUG (Fix) / REFACTOR
**Location:** [Class.Method] or [Form.DataSource.Method]

#### Problem
Describe what was happening.

#### Solution
1. [First step of the solution]
2. [Second step of the solution]
3. [Third step, if any]

#### Performance Analysis
- **Before:** [metric]
- **After:** [metric]
- **Improvement:** [% or estimated reduction]

#### Risk / Effort / Impact
- **Risk:** [Low/Medium/High]
- **Effort:** [Low/Medium/High]
- **Impact:** [Low/Medium/High]

---

### 4.2 Change 2: [TITLE]
**Type:** PERF / BUG / REFACTOR
**Location:** [Class.Method] or [Form.DataSource.Method]

#### Problem
[Describe]

#### Solution
1. [Step 1]
2. [Step 2]

#### Performance Analysis
- **Before:** [metric]
- **After:** [metric]
- **Improvement:** [%]

#### Risk / Effort / Impact
- **Risk:** [Low/Medium/High]
- **Effort:** [Low/Medium/High]
- **Impact:** [Low/Medium/High]

---

## 5. Recommended Integrated Tests

### 5.1 Smoke Test
1. Open form without errors
2. Navigate records smoothly
3. Validate displayed data is correct

### 5.2 Functional Tests
1. Scenario 1: [description with steps]
2. Scenario 2: [description with steps]
3. Scenario 3: [description with steps]

### 5.3 Performance Tests
1. Run with 50+ rows: validate response < [X] seconds
2. Monitor queries: confirm expected reduction
3. Monitor CPU/Memory: no abnormal growth

---

## 6. Deployment Notes
1. SPS tags applied for auditability (e.g. `<SPS - 09/04/2026 - US_122249>`)
2. No business logic changes
3. Changes are surgical and well documented
"""


def build_report(report_type: str, title: str, date: str, context: str, source_artifact: str, body: str) -> str:
    if report_type == "technical-report":
        return build_scenario_analysis_report(title, date, context, source_artifact, body)
    if report_type == "session-resume":
        return build_results_report(title, date, context, source_artifact, body)
    if report_type == "change-report":
        return build_technical_change_report(title, date, source_artifact, body)
    raise ValueError(f"Unsupported report type: {report_type}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate standardized XppAI markdown reports.")
    parser.add_argument("--report-type", required=True, choices=["change-report", "session-resume", "technical-report"])
    parser.add_argument("--title", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--context", default="")
    parser.add_argument("--source-artifact", required=True)
    parser.add_argument("--body-path", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    body = read_body(args.body_path)
    output_text = build_report(args.report_type, args.title, args.date, args.context, args.source_artifact, body)
    Path(args.output).write_text(f"{output_text}\n", encoding="utf-8")


if __name__ == "__main__":
    main()
