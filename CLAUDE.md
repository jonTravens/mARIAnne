# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mARIAnne** is an accessible web components library (`@marianne/core`) built with **Lit 3** and **TypeScript**. It's an npm workspaces monorepo orchestrated by Turborepo with a dual distribution strategy (NPM + CDN).

## Commands

### Monorepo (root)

```bash
npm run build             # Build all packages/apps
npm run dev               # Parallel dev mode (watch)
npm run test              # Run all tests
npm run lint              # Lint all packages
npm run format            # Prettier (TS, JS, JSON, CSS, Astro, MD)
npm run create mr-<name>  # Scaffold a new component
```

### Core package (`packages/core/`)

```bash
npm run build:manifest  # Generate custom-elements.json (CEM)
npm run build:bundles   # esbuild → dist/ (NPM) + cdn/
npm run build:css       # Process CSS themes
npm run build:types     # tsc --emitDeclarationOnly
npm run test            # vitest run (single pass)
npm run test:watch      # vitest (interactive)
npm run test:coverage   # vitest --coverage
npm run lint            # eslint src
```

### Docs app (`apps/docs/`)

```bash
npm run dev    # Astro dev server (requires custom-elements.json to exist first)
npm run build  # Astro static build
```

## Architecture

### Structure

```
packages/core/src/
  components/   # One directory per component (e.g., button/, stepper/)
  controllers/  # Reusable Lit ReactiveControllers
  context/      # @lit/context providers for parent-child communication
  state/        # Pure state computation engines
  styles/       # Shared CSS (reset, utilities, animations, themes/)
  types/        # TypeScript interfaces
  index.ts      # Barrel export
apps/docs/      # Astro 5 + MDX documentation site
```

### Component file conventions

Each component lives in `components/<name>/` with:

- `<name>.ts` — LitElement class, decorated with `@customElement('mr-<name>')`
- `<name>.styles.ts` — Lit `css` tagged template styles
- `<name>.test.ts` — Vitest tests

Complex components add:

- `<name>.renderer.ts` — Separate render helpers (e.g., `renderDesktop` / `renderMobile`)
- `<name>.utils.ts` — Helper functions

### Naming conventions

- **Tag names**: `mr-<name>` (prefix defined in `packages/core/package.json` → `config.componentPrefix`)
- **Class names**: `Mr<Name>` (PascalCase)
- **Custom events**: prefixed `mr-` (e.g., `mr-click`, `mr-stepper-step-changed`)
- **CSS custom properties**: `--mr-<component>-<property>` (e.g., `--mr-button-bg`)
- **CSS parts**: `part="base"`, `part="label"`, `part="prefix"`, `part="suffix"`

### Key patterns

**Properties**: Always use `reflect: true` for attributes that should sync to HTML.

**Global type declaration**: Every component file ends with:

```typescript
declare global {
    interface HTMLElementTagNameMap {
        'mr-<name>': Mr<Name>;
    }
}
```

**Custom events**: Always `{ bubbles: true, composed: true }` to traverse Shadow DOM.

**Parent-child composition**: Use `@lit/context` — parent exposes a `ContextProvider`, child subscribes via `ContextConsumer`. See `stepper/` for reference.

**No Shadow DOM components**: Data-container components (e.g., `mr-stepper-item`) override `createRenderRoot()` to return `this`.

### Build outputs

- `dist/` — Tree-shakeable ESM, Lit as external peer dep
- `cdn/` — Self-contained bundle (Lit bundled in), includes an autoloader
- `custom-elements.json` — Source of truth for all component metadata; consumed by the docs app

### Testing pattern

```typescript
async function fixture(html: string): Promise<MrComponent> {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const el = template.content.firstElementChild as MrComponent;
    document.body.appendChild(el);
    await (el as any).updateComplete;
    return el;
}
```

### Docs generation

`packages/core/cem.config.js` configures `@custom-elements-manifest/analyzer` to generate:

- `custom-elements.json` — component API (props, events, slots, CSS parts/props)
- `vscode.html-custom-data.json` / `vscode.css-custom-data.json` — IDE completions

JSDoc in component files drives documentation. Use the `@subcomponent` tag for parent-child relationships.

## Tooling Notes

- **Commits**: Conventional Commits enforced by commitlint + Husky
- **Pre-commit**: lint-staged runs ESLint + Prettier on staged files
- **TypeScript**: strict mode; use inline type imports (`import type`)
- **Prettier config**: 100 char width, 4 spaces, single quotes
- **Node requirement**: >=20, npm >=10
