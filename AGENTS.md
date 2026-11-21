# AGENTS.md

## What this is
An exact mirror of the live site https://exclusivehempfarms.de/. Files were downloaded byte-for-byte; the user asked for a 100% recreation with no changes. Do not "improve", reformat, or rename anything unless explicitly asked.

## Layout
- `public/` — the publish directory (set in `netlify.toml`). No build step.
  - `*.html` — pages (index, collection, vapes, pre-rolls, edibles, flavour pages, story, lab-reports, privacy, 404).
  - `*.js` — native ES modules; `app.js` is the entry and lazily imports feature modules.
  - `*.css` — per-feature stylesheets.
  - `assets/` — images, fonts, films (`flavour-cinema/`), 3D models (`models/*.glb` + `*.json` metadata).
  - `vendor/three/` — vendored three.js + GLTFLoader.
  - `_headers` — copies the original server's CSP / robots / nosniff headers.

## Non-obvious decisions
- Asset URLs carry `?v=hash` cache-busters; static hosting ignores the query, so files are stored without it.
- Many asset paths are built dynamically in JS (`assets/models/${id}.glb`, `assets/flavour-cinema/${film}-${mobile|desktop}.mp4`). If you add a product, add every derived file.
- The CSP whitelists inline scripts by SHA-256 hash. Editing any inline `<script>` requires updating the hash in `_headers`, or the script is blocked.
- `robots.txt` / `X-Robots-Tag` deliberately block indexing, as on the original.
