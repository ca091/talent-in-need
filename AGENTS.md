## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses the single-context domain documentation layout. See `docs/agents/domain.md`.

## Nuxt UI conventions

- Prefer Nuxt UI components over custom equivalents for interactive controls and common surfaces.
- Wrap the application with `UApp`.
- Query the Nuxt UI MCP or generated `.nuxt/ui/*.ts` theme files before using unfamiliar props, slots, or events.
- Use Nuxt UI semantic colors such as `text-default`, `text-muted`, `bg-elevated`, and `border-muted` instead of raw palette colors.
- Use Tailwind CSS utilities for layout, spacing, responsive behavior, and one-off presentation.
- Prefer inherited typography from `body`; add font family, size, color, or weight utilities only for intentional semantic or visual exceptions.
- Use `i-lucide-*` icon names and accessible Nuxt UI/Reka UI primitives.
- Prefer logical directional utilities such as `ms`, `me`, `ps`, and `pe`.
