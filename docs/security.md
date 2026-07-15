# Security

## Principles

- Security by default.
- Least privilege.
- Fail securely.
- Defense in depth where proportionate.
- Secure by design without overengineering a local-first app.

## Secrets

- Do not commit secrets, tokens, keystores, certificates or private environment files.
- Use environment variables or provider-managed secret storage for future build/release credentials.
- `.env`, `.env.*`, `.expo/`, `build/`, native build folders and private key/certificate formats must remain ignored.
- Never log tokens, passwords, private keys, certificates or sensitive local data.

## Authentication and Sessions

No user authentication or session management is required for the MVP. If cloud sync or accounts are introduced later, this document must be updated before implementation.

## Authorization

No roles or multi-user permission model exist in the MVP. All local data belongs to the local app user.

## Input Validation and Output Handling

- Validate all user-provided names after trimming.
- Validate CSV header, row type, references, language and theme before applying imports.
- Reject invalid import files without partially corrupting local data.
- Do not show raw stack traces to users.
- Keep error messages understandable and non-sensitive.

## Logging and Error Handling

- Log only diagnostic events that help understand failures.
- Redact or avoid full user datasets, CSV content and file paths when not necessary.
- Do not log secrets, tokens, passwords, certificates, PII-like free text, full prompts or sensitive outputs.
- Import/export and reset flows should report safe progress and failure messages to the user.

## Communications

The MVP has no backend communication requirement. Future network features must use HTTPS/TLS and reject insecure protocols unless there is a documented local-development exception.

## Database and Filesystem

- Use structured persistence APIs and parameterized operations where applicable.
- Keep local database access scoped to app data.
- Validate file type/content for CSV imports.
- Do not trust file names or paths from external pickers.
- Generated build artifacts must not be committed.

## APIs and Integrations

Current external integration is limited to platform file sharing/picking and Expo/EAS build workflows. Future APIs must define timeout, retry, validation and rate-limit behavior.

## Frontend and UX Security

- Destructive actions require clear confirmation.
- Import errors must not expose internals.
- Reset database must clearly state the consequence.
- Theme/language/import controls must not obscure security-relevant confirmations.

## Privacy

- Data is local-first and personal to the device/browser.
- Collect no analytics by default.
- Exported CSV files contain user meal data and should be treated as private by the user.
- No retention policy is required server-side because there is no backend.

## Dependencies

- Keep dependencies minimal and maintained.
- Do not install packages directly when Expo warns they should be managed by Expo.
- Run dependency checks before public release when practical.

## Threats, Mitigations and Residual Risks

| Threat | Mitigation | Residual risk |
| --- | --- | --- |
| Secret accidentally committed | `.gitignore`, repo scan before public release | Historical Git history still requires review before public publication. |
| Malformed CSV corrupts data | Validate before applying import | Parser bugs remain possible. |
| User deletes local data accidentally | Confirmation for destructive reset/delete | User can still confirm unintended actions. |
| Sensitive meal data shared | User-controlled export/share flow | Shared CSV may leave device through user action. |
| Build credentials leaked | Store credentials outside repo/provider-managed | Misconfigured external tooling can still leak data. |

## Prohibited Practices

- Hardcoded secrets.
- Secrets committed to Git.
- Disabling TLS verification.
- Exposing stack traces to users.
- Logging sensitive data or full import files.
- Concatenated SQL or unvalidated filesystem paths.
- Unmaintained dependencies kept without reason.
- Disabling safety checks without a documented decision.

## Decisions to Record

Record security-significant changes in `docs/decisions.md`, especially cloud sync, authentication, analytics, external APIs, store credentials and import/export format changes.
