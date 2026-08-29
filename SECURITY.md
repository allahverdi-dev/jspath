# Security Policy

JSPath takes security issues seriously.

This repository is publicly visible for portfolio review, demonstration, evaluation, and educational review, but it is **not an open-source project**. Security research and vulnerability reporting do not grant any broader right to reuse, redistribute, republish, commercialize, or create derivative works from JSPath.

Please read the repository's [`LICENSE`](LICENSE) before performing any security-related review.

---

## Supported Versions

Security fixes are considered for the current production version of JSPath and the current `main` branch.

| Version | Supported |
| --- | --- |
| Current production deployment | ✅ Yes |
| Current `main` branch | ✅ Yes |
| Older commits or archived states | ❌ No |
| Unofficial forks, mirrors, or modified copies | ❌ No |

Live application:

https://jspath.vercel.app

Repository:

https://github.com/allahverdi-dev/jspath

---

## Reporting a Vulnerability

Please **do not open a public GitHub issue** for a vulnerability that could expose users, data, credentials, authentication flows, sandbox boundaries, or deployment infrastructure.

Instead, contact the repository owner privately through an appropriate private GitHub contact method or other private contact information published by the owner.

Repository owner:

**Allahverdi Həsənov**  
GitHub: [@allahverdi-dev](https://github.com/allahverdi-dev)

If private GitHub vulnerability reporting is enabled for this repository, prefer that mechanism.

---

## What to Include in a Security Report

A useful vulnerability report should include:

- a clear description of the issue
- affected route, feature, component, service, or configuration
- the security impact
- steps to reproduce
- proof-of-concept details that are sufficient to demonstrate the problem without causing harm
- browser and operating system, when relevant
- whether authentication is required
- whether the issue affects guest mode, authenticated mode, or both
- relevant console output or error messages
- screenshots or recordings when helpful
- any suggested remediation, if known

Please remove all real secrets, access tokens, personal data, and unrelated user information from screenshots, logs, and examples.

---

## Please Do Not Disclose Publicly

Until the issue has been reviewed and, where appropriate, fixed, please do not publicly disclose:

- exploit instructions
- working attack payloads
- authentication bypass techniques
- sandbox escape details
- credentials or tokens
- private environment configuration
- sensitive user data
- unpublished security fixes
- step-by-step instructions that materially increase the risk of abuse

Coordinated disclosure is preferred.

---

## Security Scope

Security reports may include issues related to:

### Application Security

- cross-site scripting
- unsafe HTML rendering
- client-side injection
- unsafe URL handling
- unintended data exposure
- insecure state handling
- authentication or authorization mistakes
- privilege or account-boundary issues

### Code Execution Sandbox

JSPath executes learner code in isolated environments.

Relevant reports may include:

- sandbox escapes
- execution outside the intended worker or iframe boundary
- access to parent-page capabilities that should be unavailable
- failure of execution timeouts
- infinite-loop protection bypasses with meaningful security impact
- unintended access to application state or browser APIs
- unsafe communication between execution contexts

### Authentication and Supabase Integration

Supabase support is optional, but security reports may include:

- authentication bypasses
- authorization failures
- insecure session handling
- Row Level Security mistakes
- guest-to-account migration vulnerabilities
- unintended cross-user data access
- unsafe client configuration

Do not attempt to access another real user's account or private data while testing.

### Deployment and Configuration

Reports may include:

- exposed secrets
- unsafe production configuration
- unintended source maps or internal data exposure with security impact
- security-sensitive routing or header issues
- vulnerable deployment behavior

### Dependencies

Reports about known vulnerable dependencies are welcome when:

- the vulnerable dependency is actually used by JSPath
- the vulnerable code path is reachable or plausibly relevant
- the issue is not merely an automated scanner result without practical context

---

## Out of Scope

The following generally do not qualify as security vulnerabilities on their own:

- missing security headers without a demonstrated impact
- generic dependency scanner output with no affected code path
- outdated package versions with no known impact on JSPath
- self-XSS requiring a user to intentionally paste code into their own console
- issues that require modifying the local source code first
- attacks against unofficial forks or mirrors
- social engineering against the repository owner
- denial-of-service claims based only on intentionally expensive local learner code already constrained by the sandbox
- UI bugs with no security impact
- content inaccuracies that belong in an educational-content issue
- theoretical concerns without a reproducible security consequence
- automated reports that contain no validation or context

---

## Rules for Good-Faith Security Research

Good-faith security research should be:

- limited to what is necessary to identify and demonstrate a vulnerability
- performed against your own test state or account whenever possible
- non-destructive
- privacy-preserving
- proportionate to the suspected issue
- stopped immediately if you encounter private data belonging to another person

Do not intentionally access, alter, delete, retain, or disclose data that does not belong to you.

Do not continue testing beyond what is reasonably necessary to confirm the issue.

---

## Prohibited Testing

The following activities are not authorized:

- destructive testing
- denial-of-service or resource-exhaustion attacks
- high-volume automated traffic
- credential stuffing
- brute-force authentication attacks
- phishing or social engineering
- malware deployment
- persistence mechanisms
- data exfiltration
- accessing another user's private information
- modifying or deleting another user's data
- attacking third-party services used by the project
- bypassing rate limits through distributed or deceptive methods
- testing against infrastructure that is not owned or controlled by the JSPath project
- publishing or selling exploit details before coordinated disclosure

If a vulnerability can be demonstrated without performing one of these actions, use the safer method.

---

## Safe-Harbor Intent for Good-Faith Reports

The project owner does not intend to pursue claims solely against a researcher who:

- acts in good faith
- follows this security policy
- avoids harm to users and infrastructure
- does not exploit a vulnerability beyond what is necessary to demonstrate it
- reports the issue privately
- provides reasonable time for review and remediation before disclosure
- does not use the security review as a basis to copy, redistribute, republish, commercialize, or create derivative works from JSPath

This statement is intended to support responsible vulnerability reporting. It does not waive ownership rights, grant an open-source license, authorize prohibited testing, or override applicable law.

---

## Handling Secrets

Never include real credentials in:

- GitHub issues
- pull requests
- commit history
- screenshots
- logs
- example `.env` files
- vulnerability proof-of-concepts

Examples of sensitive values include:

- private API keys
- service-role keys
- access tokens
- refresh tokens
- session tokens
- passwords
- private signing keys
- deployment credentials

If you accidentally discover an exposed secret, report the location privately and do not use the secret.

If you accidentally commit a secret to your own branch while working on an authorized contribution, revoke or rotate it immediately rather than relying only on deleting the commit.

---

## Third-Party Services

JSPath may use third-party technologies and services such as:

- Vercel
- Supabase
- GitHub
- npm packages
- browser APIs

Security issues that exist entirely within a third-party service should generally be reported to that provider through its own security process.

If a third-party issue becomes a JSPath vulnerability because of how JSPath integrates or configures that service, a report to JSPath is appropriate.

---

## Disclosure Process

After receiving a report, the repository owner may:

1. review and reproduce the issue
2. assess impact and affected components
3. prepare a fix or mitigation
4. test the fix
5. deploy the remediation
6. coordinate disclosure with the reporter when appropriate

Response and remediation time can vary depending on severity, reproducibility, complexity, and availability.

No fixed service-level agreement is promised.

Please avoid public disclosure until there has been a reasonable opportunity to investigate and address the issue.

---

## Security Fixes

Security-related changes should preserve the project's existing quality gates where applicable:

```bash
npm run lint
npm run test
npm run content:audit
npm run content:verify
npm run content:examples
npm run build
```

A security fix should not unnecessarily weaken:

- sandbox isolation
- input validation
- authentication boundaries
- authorization rules
- guest/account separation
- content integrity checks
- test coverage
- production build guarantees

---

## Proprietary License Reminder

JSPath is proprietary software.

Security research, issue reporting, access to the source code, or communication with the repository owner does not grant permission to:

- reuse JSPath source code
- copy educational content
- publish a clone or fork
- redistribute the project
- commercialize the project
- create derivative products
- use JSPath materials outside the rights expressly permitted in [`LICENSE`](LICENSE)

See:

[`LICENSE`](LICENSE)

and:

[`CONTRIBUTING.md`](CONTRIBUTING.md)

for the applicable repository terms.

---

## Contact

For security matters, contact the repository owner privately.

**Allahverdi Həsənov**  
GitHub: [@allahverdi-dev](https://github.com/allahverdi-dev)

Repository:

https://github.com/allahverdi-dev/jspath

Live application:

https://jspath.vercel.app

---

Copyright © 2026 Allahverdi Həsənov. All Rights Reserved.
