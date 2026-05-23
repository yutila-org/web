# Yutila Security Assurance Policy

This document defines the security assurance policy for the Yutila organization's web infrastructure, developed in accordance with the **ISO/IEC 18974 (OpenChain Security Assurance)** specification.

## 1. Policy Statement
Yutila is committed to maintaining a robust security assurance program to identify, assess, track, and remediate known vulnerabilities in open-source components used within our software supply chain.

## 2. Roles and Responsibilities
To sustain this program, the following roles are established:
- **SecOps Director:** Responsible for maintaining this policy, overseeing the execution of the security assurance program, and acting as the primary point of contact for security inquiries.
- **Maintainers / Developers:** Responsible for reviewing automated security scans, conducting contextual risk assessments, and applying necessary patches or mitigations.

## 3. Vulnerability Detection and Tracking
Yutila utilizes automated CI/CD pipelines to ensure continuous vulnerability detection:
- **Secret Scanning:** `gitleaks` is executed on all pull requests and pushes to prevent credential leakage.
- **Component & IaC Scanning:** `trivy` scans the filesystem on builds to identify known CVEs in dependencies and infrastructure-as-code configurations.
- **Dynamic Application Security Testing (DAST):** OWASP ZAP is scheduled to run daily against deployed environments.
- **Software Bill of Materials (SBOM):** An SPDX-formatted SBOM is generated via `syft` on every build and retained as a build artifact to provide an ongoing inventory of open-source components.

## 4. Vulnerability Risk Assessment
Automated detection of a vulnerability (e.g., a CVE reported by Trivy) triggers a formal risk assessment process:
- CVSS base scores provided by scanning tools are used as a baseline, but the actual impact score must be evaluated based on Yutila's specific deployment context (e.g., evaluating if the vulnerable execution path is reachable).
- Risk assessments, including decisions to accept risk or mark vulnerabilities as false positives, must be documented in the centralized SIEM (Security Information and Event Management) system for auditability.

## 5. Remediation and Mitigation
Identified vulnerabilities must be remediated or mitigated based on their contextually assessed risk level:
- **Critical Risk:** Patch, update, or implement mitigating controls within **7 days** of discovery.
- **High Risk:** Patch, update, or implement mitigating controls within **30 days** of discovery.
- In scenarios where an upstream patch is unavailable, alternative mitigating controls (e.g., WAF rules, isolation) must be documented and implemented.

## 6. Policy Review and Updates
This Security Assurance Policy must be reviewed and updated by the SecOps Director at least annually, or following significant changes to the infrastructure or threat landscape.
