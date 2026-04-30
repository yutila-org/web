---
layout: ../../layouts/MarkdownLayout.astro
title: "Access Control Policy"
lastEdited: "30/4/2026"
---

## 1. Scope & Purpose

This Access Control Policy defines the framework, mechanisms, and administrative procedures governing access to all physical, logical, and infrastructural assets within Yutila. The primary objective is to protect organizational assets from unauthorized disclosure, modification, or destruction, while ensuring that personnel have the access necessary to fulfill their operational responsibilities.

This policy applies to all employees, contractors, third-party vendors, and any entity requesting or possessing access to Yutila's systems, repositories, or environments.

## 2. Access Control Architecture

Yutila employs a hybrid access control model combining Role-Based Access Control (RBAC) for logical organizational grouping and Attribute-Based Access Control (ABAC) for granular resource provisioning.

This architecture enforces the Principle of Least Privilege (PoLP) and default-deny paradigms across all operational layers. 

Due to the absence of centralized automated identity management systems, identity state, role mappings, and pillar assignments are reconciled and maintained manually via an internal tracking matrix.

## 3. Organizational Pillars & Logical Roles (RBAC)

Organizational identity is logically partitioned into three core pillars. Assignment to a pillar establishes a baseline organizational identity but **does not** automatically grant access to underlying infrastructure, specific repositories, or production environments.

### 3.1. Governance Pillar
Responsible for operational oversight, policy enforcement, and compliance tracking.
- **Access Constraints:** Members operate with intentionally limited systems access. Access is restricted to documentation repositories, audit logs, and non-production management interfaces.

### 3.2. Security Pillar
Responsible for threat modeling, vulnerability management, access auditing, and incident response.
- **Access Constraints:** Requires extensive read access across environments for auditing purposes. Write access and production mutation privileges are strictly isolated to security-specific tooling and emergency response protocols.

### 3.3. Engineering Pillar
Responsible for the design, development, and deployment of software and infrastructure.
- **Access Constraints:** Logical grouping for developers and site reliability engineers. Baseline access is limited to internal communication channels and public documentation. All codebase and infrastructure access must be provisioned individually.

## 4. Access Provisioning & Revocation Procedures (ABAC & PoLP)

Granular access to specific systems, repositories, and production environments is granted strictly on an individual, per-resource basis. 

### 4.1. Provisioning 
1. **Request Generation:** An individual requiring access to a specific resource must submit a formal request detailing the required resource, the duration of access, and the operational justification.
2. **Authorization:** The request must be approved by the corresponding resource owner and a designated member of the Governance or Security pillar.
3. **Implementation:** Upon approval, access is provisioned with the absolute minimum privileges required to execute the stated operational justification (Principle of Least Privilege).

### 4.2. Revocation
1. Access must be immediately revoked under the following conditions:
    - Termination of employment or contract.
    - Reassignment to a role that no longer requires the specific access.
    - Detection of policy violation or security anomaly.
2. Revocation procedures take precedence over all other administrative tasks.

## 5. Auditing & Review

To ensure continuous compliance and to mitigate authorization drift, access matrices are subject to mandatory periodic review.

1. **Manual Reconciliation:** A designated auditor from the Security or Governance pillar must manually cross-reference the internal identity tracking spreadsheet against actual provisioned access in target systems (e.g., GitHub organization permissions, cloud provider IAM).
2. **Frequency:** Comprehensive audits must be conducted quarterly.
3. **Remediation:** Any detected discrepancies, over-provisioned accounts, or unauthorized access must be immediately remediated and documented as an incident for root-cause analysis.
