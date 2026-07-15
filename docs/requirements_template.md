# Requirements Template

This document defines the standard for writing `docs/requirements.md`. It does not define project requirements.

## Writing Principles

Requirements must be:

- clear;
- atomic;
- unambiguous;
- verifiable;
- testable;
- traceable.

## Concept Separation

| Concept | Meaning |
| --- | --- |
| Requirement | Expected system behavior or capability. |
| Constraint | Limit that affects acceptable solutions. |
| Assumption | Declared belief accepted until disproven. |
| Domain rule | Business/domain invariant. |
| Acceptance criterion | Observable condition proving the requirement is satisfied. |

## Requirement Format

| Field | Description |
| --- | --- |
| ID | Stable ID, e.g. `REQ-001`. |
| Title | Short name. |
| Description | What the system must do. |
| Rationale | Why it matters. |
| Actors | Users/systems involved. |
| Preconditions | Required state before execution. |
| Main flow | Expected successful flow. |
| Alternatives/errors | Relevant alternatives and failures. |
| Domain rules | Rules that constrain behavior. |
| Acceptance criteria | Given/When/Then or observable checklist. |
| Impacts | Security, data, privacy, integration, performance, accessibility or operations if relevant. |
| Priority | `MUST`, `SHOULD`, `COULD`. |
| Status | `Draft`, `Approved`, `Changed`, `Deprecated`. |
| Traceability | Links to future tasks, decisions, tests and risks. |

## IDs and Classifications

- Requirement IDs: `REQ-001`, `REQ-002`, ...
- Priority: `MUST`, `SHOULD`, `COULD`
- Status: `Draft`, `Approved`, `Changed`, `Deprecated`

## Acceptance Criteria

Use either:

```gherkin
Given <context>
When <action>
Then <observable result>
```

Or an observable checklist.

## Traceability

Prepare links to:

- `docs/tasks.md`
- `docs/decisions.md`
- tests
- risks

Use `To be defined` when links are not available yet.

## Minimal Example

| Field | Value |
| --- | --- |
| ID | REQ-001 |
| Title | Save user item |
| Description | The system must allow the user to save a valid item. |
| Rationale | Saved items must be available later. |
| Actors | User |
| Preconditions | The user has entered valid data. |
| Main flow | User confirms save; system stores the item; system shows confirmation. |
| Alternatives/errors | Invalid data is rejected with an understandable message. |
| Domain rules | Item name must not be empty. |
| Acceptance criteria | Given valid data, When the user saves, Then the item is visible in the list. |
| Impacts | Data persistence. |
| Priority | MUST |
| Status | Draft |
| Traceability | `docs/tasks.md`: To be defined. |
