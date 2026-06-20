# Design Document: QA Testing Report

## Overview

This feature produces a comprehensive QA analysis of the OnlySplit expense sharing application (React 19 + Vite 8 + Capacitor 8, web + Android) through a functional-testing-first approach. The output consists of three deliverable files placed at the project root: QA_REPORT.md (comprehensive bug report with evidence), LAUNCH_READINESS.md (go/no-go assessment), and PRE_LAUNCH_CHECKLIST.md (prioritized fix list). After generating all reports, the process halts and awaits explicit developer approval before any bug fixes are applied.

## Architecture

### High-Level Approach

The QA report generation follows a **functional-testing-first pipeline** that simulates real user flows across three personas (Normal, Malicious, Impatient), validates findings by tracing execution paths through the application layers, and produces structured documentation with full evidence. Static code analysis serves as a supporting role to explain root causes of functional findings.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    QA Report Generation Pipeline                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐    ┌───────────────────────┐    ┌────────────────┐  │
│  │  Application      │───▶│  Functional Testing   │───▶│  Finding Entry │  │
│  │  Execution        │    │  (3 Perspectives)     │    │  with Evidence │  │
│  └──────────────────┘    └───────────────────────┘    └────────────────┘  │
│           │                         │                          │           │
│           ▼                         ▼                          ▼           │
│  ┌──────────────────┐    ┌───────────────────────┐    ┌────────────────┐  │
│  │  Static Code      │    │  Platform Launch      │    │  Report        │  │
│  │  Analysis         │───▶│  Checks (9 scenarios) │───▶│  Builder       │  │
│  │  (Supporting)     │    │                       │    │  (3 files)     │  │
│  └──────────────────┘    └───────────────────────┘    └────────────────┘  │
│                                                                │           │
│                                                                ▼           │
│                                                       ┌────────────────┐  │
│                                                       │  Approval Gate │  │
│                                                       │  (STOP & WAIT) │  │
│                                                       └────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Phases

1. **Functional Testing Phase** — Execute the application and simulate user flows across Normal, Malicious, and Impatient perspectives for each module. Trace interactions through component → store → service → API layers.
2. **Platform Launch Checks Phase** — Verify 9 platform-specific scenarios critical for Android Capacitor and PWA deployment.
3. **Code-Level Analysis Phase (Supporting)** — Static inspection to identify root causes and supporting evidence for functional findings. Also surfaces code quality observations.
4. **UX & Accessibility Audit Phase** — Identify accessibility gaps and UX issues discovered during functional testing.
5. **Report Generation Phase** — Compile all findings into three deliverable files with full evidence.
6. **Approval Gate Phase** — Present summary, stop execution, and wait for developer approval before any fixes.

## Components and Interfaces

### 1. Module Coverage Map

| Module ID | Module Name | Source Paths | Testing Focus |
|-----------|-------------|--------------|---------------|
| AUTH | Authentication | `services/authService.js`, `store/authStore.js`, `guards/`, `pages/auth/` | Login/signup flows, token refresh, session persistence, injection attempts |
| GRP | Groups | `services/groupService.js`, `store/groupStore.js`, `pages/GroupsPage.jsx`, `pages/GroupDetailsPage.jsx` | CRUD operations, member management, invite/join flows |
| EXP | Expenses | `services/expenseService.js`, `store/expenseStore.js`, `components/modals/AddExpenseModal` | Creation, split logic, validation, double-submit prevention |
| STL | Settlements | `services/settlementService.js`, `store/settlementStore.js`, `pages/SettlementsPage.jsx` | Balance calculation, settlement creation, state consistency |
| PAY | Payments | `services/paymentService.js` | Razorpay integration, order creation, verification, edge cases |
| DASH | Dashboard | `services/dashboardService.js`, `store/DashboardStore.js`, `pages/Dashboard.jsx` | Data aggregation, summary display, state loading |
| ACT | Activity | `services/activityService.js`, `store/activityStore.js`, `pages/ActivityFeed.jsx` | Feed rendering, pagination, real-time updates |
| ANA | Analytics | `services/analyticsService.js`, `pages/AnalyticsPage.jsx` | Chart data, date range filtering, empty states |
| SET | Settings | `services/settingsService.js`, `pages/SettingsPage.jsx` | Profile updates, preferences, validation |
| NAV | Navigation | `routes/AppRoutes.jsx`, `constants/routes.js`, `layouts/MainLayout.jsx` | Routing guards, redirect logic, back button handling |
| API | API Client | `api/client.js` | Interceptors, refresh queue, error handling, timeout behavior |
| UI | UI Components | `components/ui/` | Reusable components, loading/error/empty states, accessibility |

### 2. Bug Entry Template (with Evidence Fields)

Each finding follows this structure:

```markdown
### MODULE-NNN: Title

| Field | Value |
|-------|-------|
| **Bug ID** | MODULE-NNN |
| **Title** | Concise description |
| **Severity** | Critical / High / Medium / Low / Enhancement |
| **Module** | Module Name |
| **Affected Files/Components** | List of affected file paths and components |
| **Code References** | Specific file:line references |
| **Screenshots Needed** | Yes / No |
| **Confidence Level** | High / Medium / Low |
| **Fix Effort** | XS / S / M / L / XL |
| **Discovery Method** | Functional Testing / Static Analysis / Both |

**Preconditions:**
- List of preconditions

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Result:**
Description of correct behavior

**Actual Result:**
Description of observed/inferred incorrect behavior

**Suggested Fix:**
Code-level suggestion or approach

**Possible Root Cause:**
Technical explanation of why this occurs
```

### 3. Severity Classification

| Severity | Definition | Action |
|----------|-----------|--------|
| Critical | Data loss, security vulnerability, complete feature failure, payment corruption | Must fix before launch |
| High | Partial feature breakage, race conditions with user impact, auth bypass potential | Should fix before launch |
| Medium | Inconsistent behavior, poor error handling affecting UX, missing validations | Fix if time allows |
| Low | Minor UX improvements, cosmetic issues | Post-launch backlog |
| Enhancement | Code quality, maintainability suggestions, nice-to-have features | Post-launch improvement |

### 4. Fix Effort Scale

| Effort | Time Estimate | Examples |
|--------|--------------|----------|
| XS | < 1 hour | Missing null check, typo fix, add ARIA label |
| S | 1–4 hours | Add input validation, fix race condition, add loading state |
| M | 1 day | Refactor token refresh flow, add offline handling to a module |
| L | 2–3 days | Implement comprehensive error boundaries, redesign state management for a module |
| XL | > 3 days | Major architectural change, full accessibility overhaul |

### 5. Confidence Level Definitions

| Level | Meaning |
|-------|---------|
| High | Issue verified through functional testing with clear reproduction path |
| Medium | Issue identified through code analysis with likely but unconfirmed runtime impact |
| Low | Potential issue based on pattern analysis; needs further investigation |

### 6. Testing Perspective Definitions

| Perspective | Behavior Pattern | Focus Areas |
|-------------|-----------------|-------------|
| Normal User | Follows expected flow, provides valid input, waits for operations | Happy path correctness, data integrity |
| Malicious User | Manipulates tokens, injects scripts, tampers with payloads, exploits race conditions | Security, auth bypass, injection, data corruption |
| Impatient User | Double-clicks, navigates away during async ops, rapidly switches views, dismisses modals prematurely | Race conditions, duplicate submissions, stale state, UI consistency |

### 7. Platform-Specific Launch Checks (9 Scenarios)

| # | Check | Platform | Verification Approach |
|---|-------|----------|----------------------|
| 1 | Android Capacitor login persistence | Android | Verify token storage survives app kill/restart |
| 2 | API auth refresh behavior | Both | Token expiry, refresh rotation, concurrent request handling |
| 3 | Service worker / PWA cache | Web | Stale cache scenarios, update propagation |
| 4 | Mobile keyboard overlap | Android/Mobile | Form inputs across all pages with fields |
| 5 | Duplicate submission prevention | Both | Rapid taps on API-triggering buttons |
| 6 | Offline / poor network | Both | Timeouts, retry behavior, user feedback |
| 7 | Razorpay edge cases | Both | Script load failure, popup blocked, timeout, partial completion |
| 8 | Browser refresh behavior | Web | State restoration, data persistence across reloads |
| 9 | Android back button navigation | Android | Modal dismissal, page stack, app exit handling |

### 8. Deliverable File Interfaces

**File 1: `c:\PRO2025\onlySplit\QA_REPORT.md`**

```markdown
# QA Testing Report — OnlySplit

## Report Metadata
- Date, Version, Stack, Scope

## Methodology
- Functional testing approach description
- Tools and perspectives used

## Executive Summary
- Total findings count
- Breakdown by severity (Critical, High, Medium, Low, Enhancement)
- Breakdown by module

## Findings by Module

### Authentication (AUTH)
[Bug entries with full evidence template...]

### Groups (GRP)
[Bug entries...]

... (all modules)

## UX & Accessibility Findings
[Cross-cutting findings with evidence]

## Code Quality Observations
[Enhancement-severity findings]
```

**File 2: `c:\PRO2025\onlySplit\LAUNCH_READINESS.md`**

```markdown
# Launch Readiness Assessment — OnlySplit

## Go / No-Go Recommendation
- Decision with rationale

## Critical & High Findings Summary
- List of launch-impacting issues

## Platform Launch Checks
| Check | Status |
|-------|--------|
| Android login persistence | Pass / Fail / Needs Attention |
| ... (all 9 checks) | ... |

## Risk Assessment
- Risks of launching with known issues

## Recommended Timeline
- Fix effort estimates for Critical items
- Suggested launch date based on effort
```

**File 3: `c:\PRO2025\onlySplit\PRE_LAUNCH_CHECKLIST.md`**

```markdown
# Pre-Launch Checklist — OnlySplit

## Effort Summary
- Total Critical fix effort: X hours/days
- Total High fix effort: X hours/days
- Combined estimate: X hours/days

## Must Fix (Critical)

### Module: AUTH
- [ ] AUTH-001: Title (Fix Effort: S)
- [ ] AUTH-002: Title (Fix Effort: M)

### Module: PAY
- [ ] PAY-001: Title (Fix Effort: L)

## Should Fix (High) — Ordered by Effort

### Module: EXP
- [ ] EXP-001: Title (Fix Effort: XS)
- [ ] EXP-003: Title (Fix Effort: S)

### Module: NAV
- [ ] NAV-001: Title (Fix Effort: S)
```

### 9. Approval Gate Interface

After generating all three deliverables, the process presents:

```
═══════════════════════════════════════════════════
  QA ANALYSIS COMPLETE — AWAITING APPROVAL
═══════════════════════════════════════════════════

Total Findings: N
  Critical: X  |  High: Y  |  Medium: Z  |  Low: W  |  Enhancement: V

Estimated Total Fix Effort (Critical + High): ~N hours/days

Recommendation: GO / NO-GO

Files Generated:
  ✓ QA_REPORT.md
  ✓ LAUNCH_READINESS.md
  ✓ PRE_LAUNCH_CHECKLIST.md

⚠️  Awaiting your approval before making any code changes.
    Please review the reports and confirm which bugs to fix.
═══════════════════════════════════════════════════
```

## Data Models

### Finding Entry

```javascript
/**
 * @typedef {Object} FindingEntry
 * @property {string} bugId - Unique ID in format MODULE-NNN (e.g., AUTH-001)
 * @property {string} title - Concise description of the issue
 * @property {'Critical'|'High'|'Medium'|'Low'|'Enhancement'} severity
 * @property {string} module - Module name from coverage map
 * @property {string[]} affectedFiles - List of affected file paths and components
 * @property {string[]} codeReferences - Specific file:line-range references
 * @property {boolean} screenshotsNeeded - Whether visual evidence is needed
 * @property {'High'|'Medium'|'Low'} confidenceLevel - Certainty of the finding
 * @property {'XS'|'S'|'M'|'L'|'XL'} fixEffort - Estimated effort to fix
 * @property {'Functional Testing'|'Static Analysis'|'Both'} discoveryMethod - How issue was found
 * @property {string[]} preconditions - Required state before reproduction
 * @property {string[]} stepsToReproduce - Numbered steps (required for user-interaction findings)
 * @property {string} expectedResult - What should happen
 * @property {string} actualResult - What actually happens or is inferred to happen
 * @property {string} suggestedFix - Proposed code/architectural fix
 * @property {string} possibleRootCause - Technical explanation
 */
```

### Report Metadata

```javascript
/**
 * @typedef {Object} ReportMetadata
 * @property {string} date - Generation date (ISO format)
 * @property {string} applicationName - "OnlySplit"
 * @property {string} version - From package.json (0.0.0)
 * @property {string} stackSummary - "React 19 + Vite 8 + Capacitor 8 + Zustand 5"
 * @property {string} scopeOfAnalysis - Description of modules and perspectives covered
 */
```

### Executive Summary

```javascript
/**
 * @typedef {Object} ExecutiveSummary
 * @property {number} totalFindings - Sum of all findings
 * @property {Object} bySeverity - Counts keyed by severity level
 * @property {number} bySeverity.Critical
 * @property {number} bySeverity.High
 * @property {number} bySeverity.Medium
 * @property {number} bySeverity.Low
 * @property {number} bySeverity.Enhancement
 * @property {Object} byModule - Counts keyed by module prefix
 */
```

### Launch Check Result

```javascript
/**
 * @typedef {Object} LaunchCheckResult
 * @property {number} checkNumber - 1-9
 * @property {string} description - What was checked
 * @property {'Pass'|'Fail'|'Needs Attention'} status - Result status
 * @property {string} details - Explanation of findings
 * @property {string[]} relatedBugIds - Bug IDs related to this check
 */
```

### Approval Summary

```javascript
/**
 * @typedef {Object} ApprovalSummary
 * @property {number} totalFindings - Total count of all findings
 * @property {number} criticalCount - Number of Critical findings
 * @property {string} estimatedTotalEffort - Combined effort for Critical + High items
 * @property {'GO'|'NO-GO'} recommendation - Launch recommendation
 * @property {string[]} filesGenerated - Paths of generated files
 */
```

## Error Handling

### Analysis Edge Cases

| Scenario | Handling |
|----------|----------|
| File cannot be read | Skip file, note in methodology section as "excluded from analysis" |
| Module has no findings | Include module section with "No issues identified" note |
| Ambiguous severity | Default to the lower severity and assign Medium confidence |
| Finding spans multiple modules | Assign to primary module, list secondary modules in Affected Files |
| Code is commented out | Classify as Enhancement (dead code), don't report bugs on non-functional code |
| Cannot verify functional impact | Assign Low confidence, note as "Static Analysis" discovery method |
| Platform check cannot be fully verified | Assign "Needs Attention" status with explanation |

### Report Integrity Rules

1. Every Bug ID must be unique across the entire QA_REPORT.md
2. Sequential numbering must have no gaps within a module
3. Executive summary counts must exactly match the findings in the body
4. All severity values must be from the set: {Critical, High, Medium, Low, Enhancement}
5. All confidence levels must be from the set: {High, Medium, Low}
6. All fix effort values must be from the set: {XS, S, M, L, XL}
7. All discovery method values must be from the set: {Functional Testing, Static Analysis, Both}
8. PRE_LAUNCH_CHECKLIST Critical items must exactly match Critical findings in QA_REPORT
9. LAUNCH_READINESS platform checks must cover all 9 defined scenarios
10. Effort summary in PRE_LAUNCH_CHECKLIST must equal sum of individual item efforts

## Testing Strategy

### Validation Approach

Since this feature produces static markdown documents (not runtime code), testing focuses on **structural validation and cross-document consistency**:

1. **Template Compliance** — Every bug entry contains all prescribed fields with valid values
2. **Cross-Document Consistency** — Findings in QA_REPORT match references in LAUNCH_READINESS and PRE_LAUNCH_CHECKLIST
3. **Count Integrity** — Summary counts match body content across all documents
4. **Ordering Validation** — Checklist items follow prescribed ordering rules
5. **Format Compliance** — Checkbox format, module grouping, and ID patterns are correct

### Test Categories

| Category | What It Validates | Approach |
|----------|-------------------|----------|
| Bug entry completeness | All 16 template fields present | Parse each entry, verify field presence |
| Field value validity | Severity, Confidence, Effort, Discovery in allowed sets | Regex validation on field values |
| ID consistency | Unique IDs, correct MODULE-NNN format | Collect all IDs, verify uniqueness and pattern |
| Count integrity | Summary matches body, checklist matches report | Count findings, compare across documents |
| Ordering rules | High findings sorted by effort in checklist | Parse effort values, verify sort order |
| Cross-document consistency | Critical findings in report = must-fix in checklist | Set comparison between documents |
| Platform checks coverage | All 9 checks present with valid status | Count checks, validate status values |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Report metadata completeness

*For any* generated QA_REPORT.md, the header section SHALL contain non-empty values for date, application name, version, stack summary, and scope of analysis.

**Validates: Requirements 2.2**

### Property 2: Executive summary count consistency

*For any* generated QA_REPORT.md, the total count and per-severity counts in the executive summary SHALL exactly equal the number of corresponding findings documented in the report body, and the per-module counts SHALL exactly equal the findings under each module section.

**Validates: Requirements 2.3**

### Property 3: Findings organized under module sections

*For any* finding in QA_REPORT.md, it SHALL be nested under a valid module section heading corresponding to one of the 12 defined modules, and no findings SHALL exist outside of a module section.

**Validates: Requirements 2.4**

### Property 4: Bug entry template completeness

*For any* bug entry in QA_REPORT.md, it SHALL contain all 16 required fields: Bug ID, Title, Severity, Module, Affected Files/Components, Code References, Screenshots Needed (Yes/No), Confidence Level (High/Medium/Low), Fix Effort (XS/S/M/L/XL), Discovery Method (Functional Testing/Static Analysis/Both), Preconditions, Steps to Reproduce, Expected Result, Actual Result, Suggested Fix, and Possible Root Cause.

**Validates: Requirements 1.5, 3.1, 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 5: Bug ID uniqueness and format compliance

*For any* collection of bug entries in QA_REPORT.md, all Bug IDs SHALL be unique AND each Bug ID SHALL match the pattern `MODULE-NNN` where MODULE is a 2-4 letter uppercase prefix from the module coverage map and NNN is a zero-padded three-digit sequential number.

**Validates: Requirements 3.2**

### Property 6: Severity value validity

*For any* bug entry in QA_REPORT.md, the Severity field SHALL contain exactly one value from the set {Critical, High, Medium, Low, Enhancement}.

**Validates: Requirements 3.3, 4.1**

### Property 7: User-interaction findings have numbered reproduction steps

*For any* bug entry that documents a user-interaction scenario (Discovery Method is "Functional Testing" or "Both"), the Steps to Reproduce field SHALL contain sequentially numbered steps starting from 1.

**Validates: Requirements 3.9**

### Property 8: Code quality findings have Enhancement severity

*For any* finding classified as a code quality, maintainability, or nice-to-have suggestion, its Severity SHALL be Enhancement.

**Validates: Requirements 4.6, 12.5**

### Property 9: Launch readiness contains go/no-go recommendation

*For any* generated LAUNCH_READINESS.md, it SHALL contain a clearly stated go/no-go recommendation section with supporting rationale that references the Critical and High findings from QA_REPORT.md.

**Validates: Requirements 9.2, 9.3**

### Property 10: Platform launch checks completeness

*For any* generated LAUNCH_READINESS.md, it SHALL list all 9 platform-specific launch checks, each with a status from the set {Pass, Fail, Needs Attention}.

**Validates: Requirements 9.4**

### Property 11: Pre-launch checklist includes all Critical findings

*For any* generated PRE_LAUNCH_CHECKLIST.md, the set of Critical-severity Bug IDs listed SHALL exactly equal the set of Critical-severity findings in QA_REPORT.md, each with its corresponding Fix Effort estimate.

**Validates: Requirements 10.2**

### Property 12: Pre-launch checklist High findings ordered by effort

*For any* generated PRE_LAUNCH_CHECKLIST.md, the High-severity findings SHALL be ordered by Fix Effort from smallest to largest (XS < S < M < L < XL).

**Validates: Requirements 10.3**

### Property 13: Pre-launch checklist grouped by module

*For any* generated PRE_LAUNCH_CHECKLIST.md, all checklist items SHALL be grouped under module section headings matching their module assignment in QA_REPORT.md.

**Validates: Requirements 10.4**

### Property 14: Pre-launch checklist effort totals consistency

*For any* generated PRE_LAUNCH_CHECKLIST.md, the total estimated effort summary SHALL accurately represent the combined effort of all Critical and High severity items listed.

**Validates: Requirements 10.5**

### Property 15: Pre-launch checklist uses checkbox format

*For any* item in PRE_LAUNCH_CHECKLIST.md, it SHALL use markdown checkbox format (`- [ ]`) to enable completion tracking.

**Validates: Requirements 10.6**

### Property 16: Approval summary completeness

*For any* approval gate summary presented after report generation, it SHALL contain total findings count, Critical count, estimated total fix effort for Critical + High items, and the go/no-go recommendation.

**Validates: Requirements 11.3**
