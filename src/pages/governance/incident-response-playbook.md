---
layout: ../../layouts/MarkdownLayout.astro
title: "Incident Response Playbook"
lastEdited: "9/5/2026"
---

This playbook is designed to guide the organization through the mandatory steps for preparing, detecting, analyzing, containing, eradicating, and recovering from security incidents, aligning with the NIST Cybersecurity Framework (NIST CSF) functions and the requirements set forth in the organization’s **Security Governance Policy**.

# **1\. Alignment to NIST Cybersecurity Framework**

The structure of this playbook is aligned with the five core functions of the NIST CSF: Identify, Protect, Detect, Respond, and Recover.

| NIST CSF Function | Playbook Section | Purpose |
| :---- | :---- | :---- |
| **Identify** | I. Alignment to NIST Cybersecurity Framework | Understand the organizational context and risks. |
| **Protect** | II. Preparation and Readiness | Implement safeguards to ensure the delivery of critical services. |
| **Detect** | III. Incident Detection and Analysis | Develop and implement activities to identify the occurrence of a cybersecurity event. |
| **Respond** | IV. Response and Containment | Develop and implement activities to take action regarding a detected cybersecurity incident. |
| **Recover** | V. Eradication and Recovery | Develop and implement activities to maintain plans for resilience and restore any impaired capabilities. |

# **2\. Preparation and Readiness**

This section focuses on the proactive steps required before an incident occurs, as derived from the **Security Governance Policy** (Sections 3.1, 3.2).

## **2.1. Team and Contact Information**

The active Incident Response Team (IRT) roles and their assignees are dynamically maintained in the [Roles](/about/roles) matrix.

- **Single Source of Truth:** Refer to the "Security" pillar within the organizational matrix to identify the current Primary Owner and Fallback/Support personnel for critical response roles, specifically the **SecOps Director** and **Security Policy Officer**.

- **Contact Protocol:** Primary owners must be contacted immediately via the primary secure internal channel. If the primary owner is unreachable or the primary communication system is compromised, escalation immediately shifts to the designated Fallback/Support personnel using the offline backup contact registry.

## **2.2. Training and Review**

Mandatory requirements from the Security Governance Policy, Section 3.1, must be met to ensure readiness.

- **Security Training:** Annual security awareness and secure coding training for all personnel must be completed by Date.

- **Policy Review:** This playbook, along with the Security Governance Policy, must be reviewed and updated annually by the Security Team by Date.

- **Incident Response Drill:** Conduct a mandatory annual simulated incident response drill. The next drill is scheduled for Date.

## **2.3. Access Control Check**

All personnel must adhere to the access control requirements (Security Governance Policy, Section 3.2):

- Verify all accounts adhere to the **Principle of Least Privilege**. Access rights must be reviewed quarterly.

- Confirm **Multi-Factor Authentication (MFA)** is mandatory and active for all development, source code, and production systems.

# **3\. Incident Detection and Analysis**

The detection phase involves identifying a security event and assessing its nature, severity, and scope.

## **3.1. Reporting an Incident**

All security incidents must be reported **immediately** to the Security Team via the designated channel.

- **Designated Channel:** TBA

- **Initial Report Content:** Include date/time of detection, system affected, a brief description of the suspicious activity, and the severity (Low, Medium, High, Critical).

## **3.2. Initial Triage and Severity Assignment**

The Security Lead Analyst will perform initial triage and assign a severity based on the potential business impact.

**Objective Scoring:** Incident severity must be objectively calculated using the [FIRST CVSS v4.0 Calculator](https://www.first.org/cvss/calculator/4.0). Thresholds are strictly defined as: Critical (CVSS 9.0 \- 10.0), High (7.0 \- 8.9), Medium (4.0 \- 6.9), and Low (0.1 \- 3.9).

| Severity | Description | Trigger for Escalation |
| :---- | :---- | :---- |
| **Critical** | Immediate and widespread impact on core services, significant data breach, or unauthorized access to production infrastructure. | Immediate notification of SecOps Director. |
| **High** | Significant impact on one business unit or system; high-risk finding from DAST/SAST detected in pre-prod (Security Governance Policy, Sec. 4.2). | Incident Response Team (IRT) mobilization within 1 hour. |
| **Medium** | Minor service disruption or localized security violation; high-risk finding from Risk Assessment (Security Governance Policy, Sec. 3.1). | Formal IRT notification within 4 hours. |
| **Low** | Minimal impact, usually resolved by Level 1 support (e.g., failed log-in attempts). | Tracked and monitored, no IRT required. |

## **3.3. Analysis and Validation**

The team must quickly validate the incident and gather initial evidence.

1. **Validate:** Confirm that the reported event is a genuine security incident, not a system error or false positive.

2. **Scope:** Determine the scope of compromise (e.g., which systems, users, and data are affected).

3. **Logging:** Ensure all logs are secured and not overwritten.

4. **Chain of Custody:** If the incident is severe enough that it may require legal, regulatory, or law enforcement action, all digital evidence (logs, memory dumps, disk images) must be collected and preserved in a legally sound manner. The SecOps Director must ensure documentation of exactly who handled the evidence, when it was collected, and how it was securely stored.

# **4\. Response and Containment**

The IRT is mobilized to limit the impact of the incident and prevent further damage.

## **4.1. Containment Strategy**

Implement containment measures based on the identified severity and scope.

1. **Short-Term Containment:** Isolate the affected system(s) from the network (e.g., block firewall rules, disable network interface) to stop the spread.

2. **Long-Term Containment:** Conduct in-depth analysis to identify the root cause and implement temporary fixes to ensure the threat is completely neutralized before eradication.

3. **Source Code & Dependencies:** If the incident is code-related, ensure the CI/CD pipeline enforcement rules (Security Governance Policy, Section 4.2) have been activated, preventing further deployment of vulnerable code.

## **4.2. Eradication**

Eliminate the root cause of the incident.

1. **Remove Threat:** Eradicate all instances of malware, backdoors, and unauthorized user accounts.

2. **Patch Vulnerabilities:** Apply patches or configuration changes to the system or application that allowed the compromise.

## **4.3. Communication Guidelines**

During a High or Critical incident, communication must be strictly managed to prevent misinformation and ensure regulatory compliance:

- **Internal Communication:** The SecOps Director is solely responsible for providing status updates to the core team and executive leadership.

- **External Notification:** Public Relations and Legal Counsel will collaborate to determine if, when, and how external stakeholders (affected users, partners, regulatory bodies) must be notified. All external communication must comply with applicable data breach notification laws and align with the organization's transparency standards.

# **5\. Recovery and Post-Incident Activities**

This phase focuses on restoring normal operations and learning from the incident.

## **5.1. System Restoration**

Restore affected systems to a secure, pre-incident state.

1. **Secure Restore:** Restore systems from verified secure backups.

2. **Monitoring:** Increase monitoring on restored systems for a defined period (e.g., 72 hours) to detect any recurring threat activity.

## **5.2. Post-Incident Review**

A formal review must be conducted after every High or Critical incident to improve future response efforts.

1. **Meeting:** Schedule a post-mortem meeting.

2. **Report:** Document the timeline, actions taken, lessons learned, and identified gaps.

3. **Action Plan:** Create a formal action plan to address all identified gaps and assign owners for remediation.

**Report:** Document the incident using a Blameless Post-Mortem methodology (referencing the [Google SRE Postmortem Template](https://sre.google/sre-book/postmortem-culture/)). The report must explicitly detail the Timeline, Root Cause analysis (utilizing the 'Five Whys'), Resolution, and Action Items.

## **5.3. Policy Review and Update**

Incorporate lessons learned into the Security Governance Policy and this Playbook to strengthen security controls, particularly concerning:

- **Risk Assessment:** Update the risk register based on the incident (Security Governance Policy, Sec. 3.1).

- **Security Testing:** Adjust minimum testing requirements (e.g., DAST coverage) if a security testing gap was the root cause (Security Governance Policy, Sec. 4.1).

# **6\. Technical Containment Reference**

During active breaches, responders should not rely on memory for complex isolation commands. Refer to the [SANS Digital Forensics and Incident Response (DFIR) Cheat Sheets](https://www.sans.org/blog/the-ultimate-list-of-sans-cheat-sheets/) for immediate, verifiable CLI commands covering network isolation, memory dumping, and log extraction on Linux/Unix systems.

## **6.1. Offline Readiness**

In the event of network isolation or vendor downtime, responders must not rely on live web access.

- **Mirroring**: Every SecOps Operator should have access to a local copy of the SANS DFIR Cheat Sheets or at least be able to not require them for regular operation.

- **Storage**: Store these files in the organizational vault/incident-response/procedures/ directory on local machines.

- **Update Cycle**: During the quarterly "Policy Review" (Sec 5.3), responders must run the following to sync the local mirror: wget \--mirror \--convert-links \--adjust-extension \--page-requisites \--no-parent \-P ./vault/SANS\_Mirror \[SANS\_URL\]