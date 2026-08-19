# site-ui

Small, dependency-free shared UI assets for dawikur.dev projects.

The package is copied into each project's publishable output during its build.
It is never loaded from a CDN.

## Assets

- `foundation.css` provides the shared spacing scale, box sizing, the `.ui-visually-hidden` accessibility utility, motion policy and reduced-motion handling. `--ui-motion-duration` and `--ui-interaction-duration` are the public defaults for palette and direct-interaction motion. Pages register their colour custom properties; site-ui animates them automatically after the initial render.
- `components.css` provides the `.ui-control-dock` fixed page-control layout and its optional `.ui-control-dock--grid-at-mobile` variant, theme segments (including vertical and contrast variants), responsive tag and pill variants, and the fixed `Up` action. Projects customise it through `--ui-*` CSS variables.
- `theme.js` owns the `theme` query parameter, theme controls, state-transfer links, owned-parameter updates, and clipboard feedback announced through a polite status region.
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
