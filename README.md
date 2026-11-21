# Exclusive Hemp Farms — EU range preview

A one-to-one static copy of https://exclusivehempfarms.de/: the cinematic entrance film, vape / pre-roll / edible collections, flavour pages (blueberry, cherry, grape, mango), interactive 3D product viewers, story, lab reports and privacy pages.

## Technologies
- Plain HTML, CSS and native ES modules (no build step)
- three.js (vendored in `public/vendor/three`) with GLB product models in `public/assets/models`
- MP4 films, WebP imagery, self-hosted WOFF2 fonts
- Hosted on Netlify as a static site, with the original site's security headers in `public/_headers`

## Run locally
```bash
netlify dev --port 8889
# or any static server pointed at ./public
```
