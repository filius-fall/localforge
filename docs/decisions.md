# Implementation Decisions

This document records default choices and architectural decisions made during the LocalForge backlog feature implementation.

## GitHub Workflow

### Repository Management

**Decision**: Use GitHub CLI (`gh`) for all GitHub operations (issues, PRs, merges) instead of direct API calls.

**Rationale**: Consistent, auditable workflow with automatic issue linking and PR creation. Provides traceability for all changes.

### Commit Strategy

**Decision**: Use Conventional Commits with multiple atomic commits per feature.

**Format**:
- `feat(ui): ...` - Frontend UI changes
- `feat(api): ...` - Backend API changes
- `test(frontend): ...` - Frontend test additions
- `test(backend): ...` - Backend test additions
- `docs: ...` - Documentation updates

**Rationale**: Atomic commits provide better change history and enable granular rollbacks if needed.

### Merge Strategy

**Decision**: Use `gh pr merge --merge --delete-branch` for all PRs.

**Rationale**: Preserves multi-commit history and keeps branches clean.

## Feature Implementation Decisions

### Library Selections

#### Emoji Picker

**Decision**: Use `emoji-picker-react` library.

**Alternatives considered**: `emoji-mart` (heavier), `react-emoji-picker` (less maintained).

**Rationale**: Lightweight, well-maintained, React-native with TypeScript support. Good documentation and active community.

#### Color Picker

**Decision**: Use `react-colorful` library.

**Alternatives considered**: `react-color` (larger bundle), `@hello-pangea/color` (different API).

**Rationale**: Simple API, tree-shakeable, supports both HEX and RGB inputs/outputs with minimal dependencies.

#### Palette Generator

**Decision**: Use `color-thief` library for color extraction.

**Alternatives considered**: Custom implementation (complex), `node-vibrant` (less features).

**Rationale**: Mature library, handles color quantization well, supports custom palette sizes. Client-side processing (no backend needed).

#### Lorem Ipsum Generator

**Decision**: Use `lorem-ipsum` library.

**Alternatives considered**: `faker` (for lorem text), `lorem-ipsum-generator` (different API).

**Rationale**: Specialized library with rich configuration options (paragraphs, sentences, words). Clean TypeScript types.

#### Data Generator

**Decision**: Use `@faker-js/faker` library.

**Alternatives considered**: `casual` (different approach), custom random data functions.

**Rationale**: Industry standard for test data generation. Extensive API for profiles, addresses, companies. Consistent seed support.

## Architecture Decisions

### Mock API Server

#### Persistence Format

**Decision**: Store mock routes in JSON file at `apps/backend/.data/mock_routes.json`.

**Schema**:
```json
{
  "version": 1,
  "updatedAt": "ISO-8601 timestamp",
  "routes": [Route objects]
}
```

**Rationale**: Simple, human-readable format. Easy to debug. Version field allows schema migrations. Git-tracked via `.gitignore` (file excluded).

#### Route Matching Strategy

**Decision**: Exact method+path match only. No wildcards. Latest `updatedAt` wins on duplicates.

**Rationale**: Predictable behavior. Matches user intent (explicit paths only). Conflict resolution via timestamps is transparent and auditable.

#### Path Normalization

**Decision**: Strip query string and trailing slash (except root `/`) before matching.

**Rationale**: Handles edge cases like `/api/test?param=1` vs `/api/test`. Consistent behavior across all requests.

#### Sensitive Headers

**Decision**: Redact sensitive header values in logs: `authorization`, `cookie`, `set-cookie`, `x-api-key`, `proxy-authorization`.

**Rationale**: Security best practice. Prevents logging of credentials in application logs.

### Decision Logger (GitHub Integration)

#### Repository Strategy

**Decision**: Create a private repository named `localforge-decisions` via `gh repo create --private`.

**Rationale**: Separates personal/architecture decisions from public code. Private repository prevents accidental exposure.

#### File Organization

**Decision**: Store ADRs in `decisions/YYYY/YYYY-MM-DD--slug.md` format.

**Example**: `decisions/2026/2026-01-28--use-typescript.md`

**Rationale**: Chronological organization by year. Human-readable filenames with date prefix. ADR format is industry standard.

#### Conflict Resolution

**Decision**: Retry with suffixes `-2`, `-3`, etc. up to `-5` for duplicate filenames.

**Rationale**: Allows manual adjustments when same-day decisions occur. GitHub API returns 409 after retries, providing clear error feedback.

#### API Integration

**Decision**: Use GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`) for writing ADRs.

**Rationale**: Direct file writes without git operations. Atomic updates. Supports branching via commit parameter.

#### Front Matter Format

**Decision**: Use YAML front matter with `status`, `date`, `tags`.

**Format**:
```yaml
---
status: accepted
date: 2026-01-28
tags: [infra, auth]
---
```

**Rationale**: Structured metadata enables programmatic ADR processing. Consistent with ADR best practices.

#### Markdown Template

**Decision**: Standard sections: Title, Date, Summary, Context, Decision, Consequences.

**Format**:
```markdown
# <Title>

## Date
YYYY-MM-DD

## Summary
<Summary or "Not provided.">

## Context
<Context or "Not provided.">

## Decision
<Decision>

## Consequences
<Consequences or "Not provided.">
```

**Rationale**: Provides structured format for ADR documentation. Empty fields use "Not provided." placeholder for clarity.

#### Environment Variables

**Decision**: Require `GH_TOKEN`, `DECISION_LOG_OWNER`, `DECISION_LOG_REPO`. Optional `DECISION_LOG_BRANCH` (defaults to `main`).

**Rationale**: Secure credential management. Token must not be exposed to frontend. Configurable branch supports different workflows.

### Base Converter

#### Supported Bases

**Decision**: Support binary (2), octal (8), decimal (10), hexadecimal (16).

**Alternatives considered**: Support all bases 2-36, custom base input.

**Rationale**: Most common bases cover typical use cases. Larger bases increase UI complexity. `BigInt` handles arbitrary precision with 128-bit limit.

#### Validation Strategy

**Decision**: Validate characters per base. Reject negatives. Error on overflow (>128 bits). Handle prefixes (`0b`, `0o`, `0x`) gracefully.

**Rationale**: Clear error messages help users. Prevents integer overflow bugs. Prefix support matches common programming formats.

### Color Converter

#### Bidirectional Conversion

**Decision**: Support HEX → RGB and RGB → HEX with synchronized two-way binding.

**Rationale**: Immediate feedback when either input changes. Better UX than separate conversion buttons.

#### HEX Format

**Decision**: Accept 6-digit hex with optional leading `#`. Output uppercase `#RRGGBB`.

**Rationale**: Standard hex format. Uppercase for consistency. Optional `#` for user convenience.

#### RGB Format

**Decision**: Accept `rgb(r, g, b)` string or three integer inputs (0-255 each).

**Rationale**: Both string parsing and individual channels provide flexibility. Validated range prevents invalid colors.

### Cheatsheets

#### Content Strategy

**Decision**: Static baseline content for 7 core topics (Git, Docker, HTTP, Regex, SQL, JS/TS, CSS, Bash/CLI).

**Alternatives considered**: Dynamic content from external API, user-contributed content.

**Rationale**: Static content is predictable, reliable, and version-tracked. Baseline covers most common developer questions. Easy to extend later.

#### Topics

1. **Git**: Basic commands (status, log, branch, checkout, diff, stash, pull/push)
2. **Docker**: Build, run, ps, images, compose, logs
3. **HTTP**: Methods, status codes, headers, JSON body, query params, CORS
4. **Regex**: Anchors, character classes, quantifiers, groups, alternation, escaping
5. **SQL**: SELECT, JOIN, GROUP BY, ORDER BY, LIMIT, INSERT, UPDATE, DELETE, indexes
6. **JavaScript/TypeScript**: const/let, arrow functions, async/await, array methods, optional chaining, nullish coalescing, generics
7. **CSS Flexbox/Grid**: Flex container/gap, alignment, Grid template/columns, responsive with minmax()
8. **Bash/CLI**: File operations, grep/ripgrep, pipes/redirects, permissions, curl basics

**Rationale**: These topics form a solid foundation for daily developer work. Each topic provides 6+ practical examples.

### Clipboard Utilities

#### Write Fallback

**Decision**: Implement `document.execCommand('copy')` fallback for older browsers or non-secure contexts.

**Rationale**: Fallback ensures clipboard works even when `navigator.clipboard` is unavailable (HTTP, non-HTTPS, browser restrictions).

#### Read Utility

**Decision**: Implement `readFromClipboard()` helper with error handling and HTTPS check.

**Rationale**: Consistent API with `copyToClipboard`. Proper error messages guide users to secure contexts.

#### Error Handling

**Decision**: Use `isSecureContext` check for read operations. Provide clear error messages for failures.

**Rationale**: Browser security policies restrict clipboard reads to secure contexts only. Explicit messages reduce confusion.

## Tool Page Patterns

### Shared Layout Classes

**Decision**: All tool pages use `tool-page`, `tool-header`, `tool-panel`, `tool-section` classes.

**Rationale**: Consistent UI across all tools. Easier to maintain and extend.

### Error Display

**Decision**: Use `.form-error` class for error messages, `.form-status` for info messages below controls.

**Rationale**: Consistent feedback patterns. Existing styles already support these classes.

### Action Buttons

**Decision**: Use `.button primary` for main actions, `.button ghost` or `.button secondary` for secondary actions.

**Rationale**: Visual hierarchy guides users. Primary buttons stand out for key actions.

## Testing Strategy

### Framework Choice

**Decision**: Use Vitest for frontend, pytest for backend.

**Rationale**: Matches project setup. Fast test execution. Built-in mocking support.

### Test Timing

**Decision**: Write tests after implementation (tests-after strategy).

**Alternatives considered**: Test-driven development (TDD).

**Rationale**: Faster iteration for new features. Existing tools make TDD overhead for rapid prototyping higher.

### Coverage Goals

**Decision**: Cover happy paths, error cases, and edge cases for each tool.

**Rationale**: Comprehensive testing ensures reliability. Users expect tools to work correctly across various inputs.

## Storage Strategy

### LocalStorage Keys

**Decision**: Use prefixed keys like `localforge_clipboard`, `localforge-decisions` for localStorage.

**Rationale**: Prevents conflicts with other apps using localStorage. Clear ownership and purpose.

### Data Retention

**Decision**: Clipboard history limited to 50 entries max. Decisions persisted locally with localStorage fallback.

**Rationale**: Prevents localStorage quota exhaustion. Provides reasonable history without bloat.

## Future Considerations

### Potential Enhancements

1. **Search**: Add search to Decision Logger for querying ADRs
2. **Tagging**: Add tag filtering and aggregation for cheatsheets
3. **Mock Server UI**: Add request history to mock server
4. **Internationalization**: Add i18n support for multi-language UI
5. **Authentication**: Add user accounts for saved preferences across tools
6. **Export**: Add export functionality for decision logs and clipboard history

### Tech Debt Tracking

1. Consider extracting shared components (forms, tables) for reuse
2. Evaluate adding E2E tests for critical workflows
3. Monitor bundle size as tool count grows
4. Consider service worker for offline support

---

**Last updated**: 2026-01-28
**Status**: All backlog features (Tasks 1-10) implemented per original plan
