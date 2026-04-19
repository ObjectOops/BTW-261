# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Ruby on Rails 8.1 backend + React 19 (TypeScript) frontend, connected via the **React on Rails** gem. Asset bundling uses **Shakapacker 9.2 + Rspack** (faster Webpack alternative) with SWC transpilation. Database is MySQL. Server-side rendering (SSR) is enabled.

## Commands

### Development
```bash
bin/setup              # Install all dependencies and prepare DB
bin/setup --reset      # Full DB reset + setup
bin/dev                # Start Rails + Webpack dev server with HMR
bin/dev static         # Start without HMR (static assets)
```

### Testing
```bash
bin/rails test                                      # Run all tests (parallel workers)
bin/rails test test/models/foo_test.rb              # Run a single test file
bin/rails test test/models/foo_test.rb:42           # Run test at a specific line
bin/rails test:system                               # Run system tests
```

### Linting & Security
```bash
bin/rubocop -f github   # Lint Ruby
bin/brakeman --no-pager # Rails security scan
bin/bundler-audit       # Gem vulnerability scan
```

### Asset Build
```bash
bin/shakapacker --watch                         # Watch and rebuild JS assets
rake react_on_rails:generate_packs              # Regenerate component registration files (run after adding new components)
RAILS_ENV=production bundle exec rails assets:precompile  # Production build
```

## Architecture

### Frontend–Backend Integration (React on Rails)

Controllers pass props to React components via instance variables:
```ruby
# app/controllers/hello_world_controller.rb
@hello_world_props = { name: "Stranger" }
```

Views render components with optional SSR:
```erb
<%= react_component("HelloWorld", props: @hello_world_props, prerender: true) %>
```

React components live under `app/javascript/src/<ComponentName>/ror_components/` and must be registered to be usable. Registration files in `app/javascript/packs/generated/` are **auto-generated** — run `rake react_on_rails:generate_packs` after adding a new component rather than editing them manually.

Components that support SSR need both a `.client.tsx` and a `.server.tsx` entry in their `ror_components/` folder.

### JavaScript Entry Points

| File | Purpose |
|------|---------|
| `app/javascript/packs/application.js` | Client-side bundle entry |
| `app/javascript/packs/server-bundle.js` | SSR bundle entry |
| `app/javascript/packs/generated/` | Auto-generated component registrations |

### Key Config Files

| File | Purpose |
|------|---------|
| `config/shakapacker.yml` | Rspack/Webpack bundler settings, HMR, output paths |
| `config/rspack/` | Custom Rspack configuration overrides |
| `babel.config.js` | SWC transpilation + React Refresh (HMR) |
| `tsconfig.json` | TypeScript strict mode config |
| `.env.example` | Required env vars (copy to `.env` for local dev) |

### CI (GitHub Actions)

The workflow in `.github/workflows/ci.yml` runs: bundler-audit → brakeman → rubocop → `bin/rails db:test:prepare test`. Mirrors `bin/ci` locally.
