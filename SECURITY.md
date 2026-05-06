# Security Policy

## Supported Versions

We currently support security updates for the latest minor release.

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |
| < 0.1   | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability in makesurenew, **please do not open a public issue**.

Instead, report it privately by:

1. Opening a [private security advisory](../../security/advisories/new) on GitHub, or
2. Emailing the maintainers (see repo profile for contact)

Please include:

- A description of the vulnerability
- Steps to reproduce
- Affected versions
- Any potential impact you've identified

## What to expect

- **Acknowledgement** within 48 hours
- **Initial assessment** within 7 days
- **Fix or mitigation plan** within 30 days for confirmed vulnerabilities
- **Public disclosure** coordinated with the reporter after a fix is released

## Scope

In scope:
- The web application (frontend + backend)
- The Docker image
- The GitHub Actions workflows
- Authentication and authorization flows

Out of scope:
- Issues in third-party dependencies (please report upstream)
- Social engineering or physical attacks
- Denial of service via volumetric attacks

Thank you for helping keep makesurenew and its users safe.
