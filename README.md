# site-ui

Small, dependency-free shared UI assets for dawikur.dev projects.

The package is copied into each project's publishable output during its build.
It is never loaded from a CDN.

## Assets

- `foundation.css` provides the shared spacing scale, box sizing and reduced-motion policy.
- `components.css` provides theme segments (including vertical and contrast variants), responsive tag and pill variants, and the fixed `Up` action. Projects customise it through `--ui-*` CSS variables.
- `theme.js` owns the `theme` query parameter, theme controls, and state-transfer links.
- `scroll-top.js` binds a `.ui-scroll-top` button.

Pages load the files from their own generated `assets/site-ui/` directory. The
consumer build is responsible for fetching this repository and copying the
assets there.

## Component catalogue

Open `index.html` locally to browse every public component and variant. The
catalogue is documentation only; consumer builds export the four runtime assets
listed above, not the catalogue itself.

## Verification

Run `make test` to check JavaScript syntax and behavior. GitHub Actions runs
the same command on pull requests and changes to `main`.
