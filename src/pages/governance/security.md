---
layout: ../../layouts/MarkdownLayout.astro
title: "Security Policies"
lastEdited: "9/5/2026"
---

# **1. Introduction and Scope**

This document establishes the security governance policy for all operations within the organization.

The scope of this policy applies to all employees, contractors, and third parties involved in the design, development, testing, deployment, and operation of company assets, including but not limited to software & hardware products, game titles, and associated infrastructure.

# **2. Policy Framework and Standards**

Our security program is structured around the principles outlined in the following frameworks:

| Framework | Core Contribution to Policy | Reference |
| :---- | :---- | :---- |
| NIST Cybersecurity Framework (CSF) | Foundation for managing cybersecurity risk, structured into five functions: Identify, Protect, Detect, Respond, Recover. | [NIST CSF](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) |
| Security Knowledge Framework (SKF) | Guidance on secure development practices, security controls, and vulnerability management throughout the SDLC. | [Security Knowledge Framework](https://www.securityknowledgeframework.org/) |
| Common Criteria (CC) | Standards for security functional requirements (SFRs) and assurance requirements (SARs) for target of evaluations (TOEs). Used to inform product security design and testing rigor. | [Common Criteria Portal](https://www.commoncriteriaportal.org/index.cfm) |
| Linux Foundation Telemetry Data Policy | Directives for the collection, use, and management of data to ensure privacy and transparency. | [Linux Foundation](https://www.linuxfoundation.org/legal/telemetry-data-policy) |
| OpenSSF Best Practices | Baseline secure code authoring and SDLC implementation. | [OpenSSF Guidelines](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software) |
| OpenSSF Baseline Practices | Minimum required practices for deploying secure software environments. | [OpenSSF Baseline](https://baseline.openssf.org/) |

# **2.1. Core Architectural Security Principles**

All systems designed within Yutila must adhere to the foundational security principles defined by [Saltzer and Schroeder (1975)](https://web.mit.edu/Saltzer/www/publications/protection/index.html):

- **Fail-Safe Defaults:** Base access decisions on explicit permission rather than exclusion. If a system fails, it must fail into a closed, secure state.
- **Complete Mediation:** Every access to every object must be cryptographically or logically verified for authority.
- **Least Privilege:** Every program and user must operate using the minimum set of privileges necessary to complete their function.
- **Open Design:** System security should not depend on the ignorance of potential attackers. The mechanisms must be public; only the keys are secret.

# **3. Organizational Security Policies**

## **3.1. Governance and Risk Management**

The security team is responsible for reviewing and approving all security policies, managing enterprise-wide security risk, and ensuring compliance.

- **Risk Assessment:** All projects and products must undergo a formal security risk assessment utilizing a standardized methodology (e.g., STRIDE for threat modeling or a formally defined risk matrix) prior to launch.
- **Policy Review:** This policy and its associated risk assessments must be formally reviewed annually, or immediately following any major architectural shift or Critical severity incident, to ensure evolving threats are accounted for.
- **Security Training:** Mandatory annual security awareness and secure coding training is required for all personnel.

## **3.2. Access Control and Identity Management**

- **Principle of Least Privilege:** Users must be granted only the minimum access rights necessary to perform their job duties. Access must be reviewed quarterly by the IT Operations Lead or the respective system owner to ensure permissions remain appropriate and adhere to the Principle of Least Privilege.
- **Multi-Factor Authentication (MFA):** MFA is mandatory for all access to development environments, source code repositories, and production systems.
- **Termination:** Access rights must be revoked immediately upon a member's separation from the organization.
- **Secret Management & Machine Identities:** Hardcoded credentials within source code are strictly prohibited. All machine identities, API keys, and production credentials must be managed via a dedicated secrets manager (e.g., [Infisical](https://infisical.com/) or GitHub Secrets). Committing `.env` files containing production secrets is banned, and automated secret scanning must be enforced in the CI/CD pipeline.
- **Commit Signature Verification:** To ensure the integrity and non-repudiation of all code contributions, all commits pushed to organizational repositories must be cryptographically signed using a verified SSH key. Commits that are not signed will be rejected by the CI/CD pipeline and branch protection rules.
  - **Resource:** [Setup SSH Keys for Commit Signature](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

## **3.3. Incident Response and Business Continuity**

All security incidents must be reported immediately to the **SecOps Director** via the designated secure channel. The SecOps Director will orchestrate the response following the documented procedures in the playbook linked below:

[Cybersecurity Incident Response Playbook](/governance/incident-response-playbook)

### **3.3.1. Escalation Policy**

In the event of a security anomaly, personnel are required to follow the established escalation path:

- **Tier 1 (Individual Contributor/Developer):** Initial discovery. Alert the team lead and open an internal low-priority security ticket. Do not publicize the finding.
- **Tier 2 (Security Engineering Team):** Triages the ticket. If validated and categorized as High or Critical severity, the team immediately hands over control to the SecOps Director.
- **Tier 3 (SecOps Director):** Implements containment procedures, convenes the crisis management team, and decides whether legal and executive leadership need to be involved.
- **Tier 4 (Executive & Legal):** Handles public vulnerability disclosure, law enforcement collaboration, and regulatory compliance reporting (e.g., data breach notifications within statutory timelines).

## **3.4. Coordinated Vulnerability Disclosure (CVD)**

## **3.4. Coordinated Vulnerability Disclosure (CVD)**

All external vulnerability reports must be submitted using the built-in GitHub feature for reporting security vulnerabilities (Private Vulnerability Reporting). Alternatively, reports can be submitted directly via email to yutila@atomicmail.io. 
The SecOps Director will validate the report and establish a secure communication channel with the researcher.
We adhere to a strict 90-day deadline policy. If a reported vulnerability is not fixed within 90 days of the initial report, the researcher is permitted to publicly disclose it. Once a vulnerability is fixed, it is free to be publicly disclosed immediately.
Patches must be developed in an embargoed, private environment. Public disclosure and security advisories will only be published simultaneously with the deployment of the remediated release or after the 90-day deadline expires.

# **4. Secure Development Lifecycle (SDLC) Policy**

This policy outlines the mandatory security requirements for all software development projects within the organization, ensuring security is integrated throughout the development lifecycle.

**Human Verification (Peer Review):** Automated security scanners are supplementary and do not replace logical architectural review. Code merged into production branches requires human peer review, except under authorized “Solo Contributor” or “Emergency Merge” conditions. Bypassing human review requires the commit to be cryptographically signed and successfully pass all mandatory automated pipeline status checks (e.g., SAST, Secret Scanning, SBOM).

## **4.1. Quality Assurance and Security Testing**

All developed software must undergo the following minimum security and quality tests:

| Title | Description | Minimum Coverage Requirement |
| :---- | :---- | :---- |
| Unit Tests | Isolation testing of small code components or functions. | Mandatory strictly for code paths identified as high-risk during the project's risk assessment (e.g., authentication logic, payment endpoints, game state validation). |
| Integration Tests | Verification that different parts of the application or services work together correctly. | Required for high-risk system integration points and external network boundaries. |
| Software Bill of Materials (SBOM) Generation | Generates a cryptographic ledger of all third-party dependencies compiled into the final binary to track supply chain vulnerabilities using tools like [Syft](https://github.com/anchore/syft). | Mandatory for all release builds. |
| Static Application Security Testing (SAST) | Automated analysis of source code to identify structural vulnerabilities and memory safety violations before compilation. | Mandatory for all production branches. |
| Dynamic Application Security Testing (DAST)  | Analysis of the running application to find security vulnerabilities and configuration errors. | Executed asynchronously (e.g., as a scheduled nightly CI task) against Staging environments. Synchronous execution is reserved exclusively for production release gates to prevent pipeline exhaustion. |

## **4.2. Continuous Integration/Continuous Delivery (CI/CD) Security Requirements**

All software development must utilize a CI/CD pipeline that is configured to enforce the following security steps automatically:

1. **Automated Builds and Testing:** The pipeline must automatically retrieve the latest source code, compile the application, and execute all mandatory Unit, Integration, SAST, and DAST tests.
2. **Dependency Vulnerability Scanning:** All third-party libraries and dependencies used in the project must be scanned for known vulnerabilities (e.g., against CVE databases).
3. **Mandatory Pass/Fail Enforcement:** The pipeline must automatically FAIL and block deployment if tests do not pass or if High/Critical vulnerabilities are detected, *unless a formal Vulnerability Waiver and risk-acceptance justification is documented and approved by the Security Policy Officer.*

## **4.3. Security Orchestration, Automation, and Response (SOAR)**

To provide continuous visibility and threat remediation, the organization relies on a Security Orchestration, Automation, and Response (SOAR) architecture:

- **Wazuh (SIEM & XDR):** Deployed across all hosts for continuous intrusion detection, security monitoring, and log correlation.
- **Trivy:** Integrated into container registries and CI pipelines to continuously evaluate container images, file systems, and SBOMs for vulnerabilities.
- **GitLeaks:** Enforced as a pre-commit hook and a CI action to detect and block the injection of hardcoded secrets or sensitive configuration data.
- **GitHub Actions:** Serves as the primary automation orchestrator, triggering Trivy and GitLeaks scans on pull requests, and orchestrating deployment blocks if security criteria are not met.

## **4.4. Special Requirements for Game Development (Where Applicable)**

For all software classified as games or entertainment products, the following security measures are mandatory:

- **Anti-Tamper & Anti-Cheat:** All multiplayer games must implement and maintain industry-standard anti-cheat and anti-tamper technologies. These solutions must be reviewed by the **Security Policy Officer** and subjected to adversarial validation. Validation may be conducted via internal red-teaming, structural review, or a closed-beta Coordinated Vulnerability Disclosure (CVD) process prior to any public release.
- **Secure Backend Systems:** All server-side logic, APIs, and services supporting the game must fully adhere to all standards and requirements defined in Section 1 and Section 2 of this policy.
- **Client-Side Sensitive Data Protection:** Any sensitive data stored on the client side (e.g., authentication tokens, payment information, personal data) must be protected using strong encryption and secure storage mechanisms.

## **4.5. Language-Specific Security Standards**

To ensure memory safety and prevent language-specific vulnerabilities natively, all development must adhere strictly to established secure coding standards for the respective language:

- **C:** All C-based development, including the Camelot framework, must adhere to the [SEI CERT C Coding Standard](https://wiki.sei.cmu.edu/confluence/display/c/SEI+CERT+C+Coding+Standard). Compliance is structurally enforced via the project `Makefile` and CI pipeline; no code shall be merged unless it compiles with `-Wall -Wextra -Wpedantic -Werror`, passes all unit/integration tests with Clang/GCC Sanitizers enabled (`-fsanitize=address,undefined,leak`), and satisfies [clang-tidy](https://clang.llvm.org/extra/clang-tidy/) static analysis using `cert-*` check profiles.
- *(Additional language standards will be documented here prior to the adoption of new stacks in production).*

## **4.6. Third-Party Dependency Evaluation**

Integrating unverified third-party libraries introduces immediate supply chain risk. To mitigate this, all integrated third-party code and internal distributions must conform to the [OpenChain ISO/IEC 5230](https://www.openchainproject.org/resources/iso-iec-5230) and [ISO/IEC 18974](https://www.openchainproject.org/resources/iso-iec-18974) standards for license compliance and security.

**Tiered Dependency Registry**

To balance development velocity with security, the Architecture pillar maintains a tiered model for validating external Open Source Software (OSS) before adoption into the production baseline:

- **Tier 1 (Inherited Trust):** Dependencies from the yutila-org core registry or top-tier foundations (e.g., Linux Foundation, Apache, Google, Microsoft) with a GitHub Star count >1000 and active maintenance (commit within 6 months) are pre-validated for prototyping.
- **Tier 2 (Manual Audit):** New or niche dependencies require a formal “Dependency Review” issue. The Architecture pillar must evaluate the project’s security posture using the [OpenSSF Concise Guide for Evaluating OSS](https://openssf.org/blog/2022/06/30/a-concise-guide-for-evaluating-open-source-software/), [SAFECode Principles](https://safecode.org/), and the [OpenSSF Scorecard](https://securityscorecards.dev/).
- **Tier 3 (Blocked):** Dependencies with “Copyleft” licenses (e.g., [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html), [AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html)) for non-open Source projects or known “Critical” vulnerabilities are strictly prohibited from the production baseline.
  - **Copyleft Rationale (For Non-Open Source Projects):** Copyleft licenses contain viral derivative-work clauses. Statically or dynamically linking GPLv3/AGPL code into proprietary or revenue-generating Yutila projects legally triggers this clause, mandating the public release of our entire closed-source IP under the same open license. To preserve our ability to monetize software or keep specific logic proprietary, only permissive licenses (e.g., [MIT](https://opensource.org/license/mit/), [Apache 2.0](https://opensource.org/license/apache-2-0/), [BSD-3-Clause](https://opensource.org/license/bsd-3-clause/)) are authorized for integration into non-open source tracks.
  - **Vulnerability Rationale:** “Critical” CVSS dependencies often enable unauthenticated Remote Code Execution (RCE). Deploying these risks a container escape, exposing the centralized physical infrastructure to complete compromise.

**Transitive Auditing**

Prior to integration, the full dependency tree must be queried via [deps.dev](https://deps.dev/) to identify hidden transitive vulnerabilities or abandoned sub-dependencies. Approval is contingent on the health of the entire recursive tree, not just the top-level package.

# **Appendix**

To maintain a zero-cost, high-integrity CI/CD pipeline, the following open-source tools are mandated for all organizational repositories:

- **SAST & Vulnerability Scanning:** [Trivy by Aqua Security](https://aquasecurity.github.io/trivy/) (Apache 2.0 License)
- **DAST:** [OWASP ZAP (Zed Attack Proxy)](https://www.zaproxy.org/) (Apache 2.0 License)
- **Secrets Management:** [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) (Native Platform Feature)
- **SBOM Generation:** [Syft by Anchore](https://github.com/anchore/syft) (Apache 2.0 License)
