# AGENTS.md

# site-ui

This repository provides small, dependency-free UI primitives shared by dawikur.dev projects.

## Scope

Keep the package limited to shared foundations, component geometry and behavior. Consumer projects own their page layout and component colors through `--ui-*` variables. Do not add frameworks, dependencies, or project-specific components.

## Component catalogue

`index.html` is the local catalogue of every public component, variant, and supported interaction.

When adding, removing, or materially changing a public component class, variant, token, or behavior, update the catalogue and its completeness test in the same change.

## Verification

Run `make test` after changes. It checks JavaScript syntax, behavior, and the catalogue contract.
