---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions.
---

## Knowledge Graph & Codebase Exploration (Graphify)

This repository maintains a Graphify knowledge graph at `graphify-out/` to help AI agents understand cross-file relationships, architecture, and dependencies.

### Exploration Strategy

Use Graphify as the primary discovery tool when the task involves:

- Unfamiliar subsystems or architectural exploration.
- Cross-file dependency tracing.
- Understanding component relationships across registry, demos, documentation, and metadata.
- Impact analysis before modifying shared components or utilities.

Available commands:

- `graphify query "<question>"` — retrieve a scoped subgraph for architecture and codebase questions.
- `graphify path "<A>" "<B>"` — inspect dependency paths between symbols.
- `graphify explain "<concept>"` — discover nodes and relationships associated with a concept.

### Direct Code Search

Use Read, Grep, Glob, and Bash directly when:

- The target file or symbol is already known.
- Performing exact string, import, or reference searches.
- Fixing localized bugs or making small changes.
- Verifying implementation details discovered through Graphify.

Do not run Graphify for copy edits, UI string tweaks, or text modifications in known files; use direct search, read, and edit instead.

**Graphify is a discovery and navigation aid, not a source of truth.** Always verify relevant relationships, symbols, and implementation details against the actual source code using Grep and Read.

Do not run Graphify for every trivial task. Prefer the smallest exploration strategy that provides sufficient context.

### Graph Maintenance

- Run `graphify update .` after completing a meaningful batch of source-code changes when the graph needs refreshing.
- Prefer refreshing the graph after structural changes, such as adding, removing, moving, or renaming source files and changing module dependencies.
- Avoid redundant updates during intermediate edits or cosmetic/content changes (e.g. CSS values, text copy).
- Do not treat inferred graph edges as confirmed runtime or static dependencies.
- If the graph is missing, stale, or incomplete, fall back to direct code exploration.

### Subagent Instructions

Subagents performing architectural exploration should use Graphify when relevant, then verify findings against source code. Do not mandate Graphify for trivial or narrowly scoped tasks.
