---
layout: ../../layouts/MarkdownLayout.astro
title: "Access Control Policy"
lastEdited: "4/6/2026"
---

## 1. Scope & Purpose

This Access Control Policy defines the framework, mechanisms, and administrative procedures governing access to all physical, logical and infrastructural assets within Yutila. The primary objective is to protect organizational assets from unauthorized disclosure, modification or destruction, while ensuring that personnel have the access necessary to fulfill their operational responsibilities.

This policy applies to all employees, contractors, third-party vendors and any entity requesting or possessing access to Yutila's systems, repositories or environments. Due to infrastructural limitations, **all access is manually provisioned on an individual basis**.

## 2. Infrastructural Constraints & Access Model

### 2.1. Manual Provisioning Limit
Because Yutila utilizes the Free GitHub Organization plan and operates with limited infrastructural resources, automated group-based access, team synchronizations, or Identity Provider (IdP) syncs are currently impossible. All permissions must be provisioned manually.

### 2.2. Individual-Based Access Control (IBAC)
We employ a strictly manual **Individual-Based Access Control (IBAC)** model for infrastructural access. Permissions are assigned directly to each user's individual account on a per-resource basis. While organizational roles (e.g., Engineer, SecOps) dictate *what* permissions a person should receive, these roles exist purely as guidelines mapped on the website's Roles page and do not automatically inherit or sync permissions.

## 3. Email Accounts

Access control principles extend to organizational emails.

### 3.1. Role Emails
Role-based emails (e.g., `security@yutila.com`) primarily serve for common messaging and shared inboxes across all members assigned to that role. 
- Unless explicitly designated (such as a social media administration email used for YouTube, OpenCollective, or other social platforms holding account credentials), role emails **do not possess infrastructural privileges**.

### 3.2. Individual Emails (Cloudflare Forwarding)
Individual email accounts (e.g., `spiderkyle@yutila.com`) are the primary identity anchor for infrastructural access. These addresses receive manual permissions tailored to the user's functional role.

> [!WARNING]
> **Email Forwarding Security Notice:** At present, due to resource limitations, we do not host a dedicated email sending service. Individual `@yutila.com` emails rely on Cloudflare Workers to redirect incoming mail to the user's personal professional email. 
> 
> Consequently, replies from these users will come from their underlying personal domain, not `@yutila.com`. Personnel must remain vigilant against potential spoofing or social engineering attempts taking advantage of this asymmetry. When infrastructural resources permit, full send/receive capabilities will be implemented. Regardless of this limitation, the `@yutila.com` address is still strictly utilized as the identity anchor to access accounts and resources.

## 4. System & SSH Access

- **Individual Basis:** For teams requiring system-level access (such as the Security and Engineering teams), individual accounts are utilized with appropriate group policy permissions enforced at the OS level (e.g., Linux groups).
- **Shared Access (Root):** A "multiple-users-single-account" model may be utilized strictly for high-level administrative tasks, such as `root` SSH access, managed through secure key distribution and auditing.

## 5. Provisioning & Revocation Lifecycle

### 5.1. Provisioning
1. **Initial Alignment:** Access is manually provisioned by administration based on the individual's assigned role on the public website Roles page.
2. **Supplementary Access:** If an individual requires access to repositories or infrastructure outside their primary scope, they must submit a formal request detailing the target resource, permission tier, and operational justification.
3. **Execution:** Upon approval, access is manually granted at the lowest privilege tier required.

### 5.2. Revocation
Access must be immediately, manually revoked under the following conditions:
- Termination of employment or contract.
- Reassignment to a project that no longer requires specific access.
- Detection of policy violation, security anomaly, or key compromise.
Revocation procedures take absolute precedence over all other administrative tasks.

## 6. Auditing & Review

To ensure continuous compliance and to mitigate authorization drift, access matrices are subject to mandatory periodic review.

1. **Manual Reconciliation:** A SecOps Operator or Governance Auditor must manually cross-reference the website's public Roles page against actual provisioned access in target systems (e.g., GitHub collaborator lists, OpenCollective roles, and SSH keys).
2. **Frequency:** Comprehensive audits must be conducted quarterly.
3. **Remediation:** Any detected discrepancies, over-provisioned accounts, or unauthorized access mappings must be immediately remediated and documented as a security incident for root-cause analysis.