---
layout: ../../layouts/MarkdownLayout.astro
title: "Dependency Registry"
lastEdited: "9/5/2026"
---

This document serves as the authorized database of dependencies for the Yutila website repository. All additions must comply with the organizational security policies regarding supply chain risk, licensing, and transitive auditing.

## 1. Licensing Policy

To protect proprietary IP from viral open-source mandates, all third-party code must utilize permissive licenses. 

- **Permitted Licenses:** MIT, Apache-2.0, BSD-3-Clause, ISC.
- **Strictly Prohibited:** GPLv3, AGPL (and any other Copyleft licenses) *(Applies to non-open source projects only)*. 

## 2. Approved Dependencies

### Tier 1: Inherited Trust
Dependencies originating from top-tier foundations or highly active ecosystems (>1000 GitHub stars, active maintenance). These are pre-validated for integration.

| Ecosystem | Package Name | License | Source | Validation Metric |
| :--- | :--- | :--- | :--- | :--- |
| npm | `astro` | MIT | withastro | Official framework, active |
| npm | `react` | MIT | facebook | Top-tier foundation, active |
| npm | `react-dom` | MIT | facebook | Top-tier foundation, active |
| npm | `tailwindcss` | MIT | tailwindlabs | >1k stars, active |
| npm | `typescript` | Apache-2.0 | Microsoft | Top-tier foundation, active |

### Tier 2: Manually Audited
Dependencies requiring a formal audit, specific version pinning, and technical justification due to niche use cases or smaller maintainer footprints.

| Ecosystem | Package Name | Version Constraint | License | Audit Date | Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| npm | `motion` | `>=10.16.0, <11.0.0` | MIT | 30/4/2026 | Required for core UI animations. Full transitive tree verified via deps.dev. |
| npm | `clsx` | `^2.1.0` | MIT | 30/4/2026 | Standard utility for conditional Tailwind class merging. No transitive bloat. |

## 3. Blocked Dependencies (Tier 3)

The following dependencies and categories are explicitly blocked from the production baseline due to severe vulnerabilities, deprecation, or licensing violations.

| Ecosystem | Package Name | Reason for Block | Required Alternative |
| :--- | :--- | :--- | :--- |
| All | `*` (Any GPL/AGPL) | Viral copyleft clause violates proprietary licensing policy **(Applies to non-open source projects only)**. | Internally developed logic or MIT/Apache-2.0 alternatives. |
| npm | `request` | Deprecated, unmaintained, unpatched vulnerabilities. | Native `fetch` API. |
| npm | `node-forge` | Historical critical vulnerabilities; superseded by native APIs. | Native Web Crypto API. |

## 4. Integration Process

Before adding a new dependency not listed in Tier 1 or Tier 2:
1. **Verify License:** Ensure it is MIT, Apache-2.0, BSD-3-Clause, or ISC.
2. **Audit Transitive Tree:** Query the package via [deps.dev](https://deps.dev/) to ensure no hidden vulnerabilities exist in its sub-dependencies.
3. **Submit Request:** Open a Dependency Review issue to get the package audited and added to the Tier 2 list.
