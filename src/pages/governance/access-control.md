---
layout: ../../layouts/MarkdownLayout.astro
title: "Access Control Policy"
lastEdited: "14/5/2026"
---

## 1. Scope & Purpose

This Access Control Policy defines the framework, mechanisms, and administrative procedures governing access to all physical, logical and infrastructural assets within Yutila. The primary objective is to protect organizational assets from unauthorized disclosure, modification or destruction, while ensuring that personnel have the access necessary to fulfill their operational responsibilities.

This policy applies to all employees, contractors, third-party vendors and any entity requesting or possessing access to Yutila's systems, repositories or environments.

## 2. Access Control Architecture

Yutila employs a strict hybrid access control model combining **Role-Based Access Control (RBAC)** for organizational mapping and **Attribute-Based Access Control (ABAC)** for resource-level permissions. We strictly decouple **Organizational Identity** (Pillars and Functional Titles) from **Infrastructural Access** (Granular Repository Permissions).

This architecture enforces the Principle of Least Privilege (PoLP) and default-deny paradigms across all operational layers. An individual's title grants zero implicit access to codebases, secrets or production environments. 

Due to the absence of centralized automated identity management systems, identity state, scale of the organization, role mappings and pillar assignments are reconciled and maintained manually via an internal tracking matrix until further notice.

## 3. Organizational Identity: Pillars & Functional Titles (RBAC)

Personnel are organized into three core pillars. Within these pillars, individuals are assigned a **Functional Title** (also known as a Business Role). 

**Critical Constraint:** Functional Titles are purely taxonomic. They establish organizational hierarchy, reporting structure and operational focus. They **do not** automatically grant, inherit or imply access to underlying infrastructure, specific repositories or production environments.

## 4. Infrastructural Access: Repository Permissions (ABAC)

Granular access to specific systems, repositories and production environments is granted strictly on an individual, per-resource basis, regardless of the individual's Pillar or Functional Title.

### 4.1. Permission Tiers
Yutila utilizes the following strict permission tiers for repository and infrastructure access. Individuals are explicitly mapped to target repositories with one of the following assignments:

- **Read:** Can view code, clone repositories, and read discussions/issues. Granted for auditing or cross-pillar visibility.
- **Write:** Can push code (subject to Ed25519 commit signing and branch protection rules), create branches, and open pull requests. Standard assignment for Engineers actively working on a specific repository.
- **Maintainer:** Can merge pull requests, manage issues, and bypass specific non-critical branch protections (if justified). Granted only to designated code owners for a specific project.
- **Admin:** Can manage repository settings, modify branch protection rules, and manage repository secrets/variables. Strictly limited to designated repository administrators.
- **Owner:** Unrestricted access, including repository deletion and transferring ownership. Reserved exclusively for core Governance and highest-level technical administration.

### 4.2. Provisioning Lifecycle
1. **Initial Provisioning:** Baseline repository access is manually provisioned by administration concurrent with an individual's assignment to a specific project or operational unit. This initial alignment does not require a formal request.
2. **Supplementary Access (Request Generation):** If an individual requires access to repositories outside their primary assigned scope (e.g., cross-project collaboration or temporary assistance), they must submit a formal request detailing the target resource, the requested Permission Tier, the duration of access, and the operational justification.
3. **Authorization:** Supplementary requests must be approved by the corresponding repository Admin and a designated member of the Governance or Security pillar.
4. **Implementation:** Upon approval, supplementary access is provisioned with the absolute minimum tier required to execute the stated operational justification.

### 4.3. Revocation
1. Access must be immediately revoked under the following conditions:
    - Termination of employment or contract.
    - Reassignment to a project that no longer requires the specific repository access.
    - Detection of policy violation, security anomaly, or key compromise.
2. Revocation procedures take precedence over all other administrative tasks.

## 5. Auditing & Review

To ensure continuous compliance and to mitigate authorization drift, access matrices are subject to mandatory periodic review.

1. **Manual Reconciliation:** A SecOps Operator or Governance Auditor must manually cross-reference the internal identity tracking matrix (Pillars/Functional Titles) against actual provisioned access in target systems (repository permission levels).
2. **Frequency:** Comprehensive audits must be conducted quarterly.
3. **Remediation:** Any detected discrepancies, over-provisioned accounts, or unauthorized access mappings must be immediately remediated and documented as a security incident for root-cause analysis.