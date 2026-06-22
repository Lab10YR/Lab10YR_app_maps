# Lab10YR_app_maps

The public **lab10yr.com** static site: interactive soil/ground-intelligence map apps,
data stories, reports, and tools. Served as the Pages origin behind the `lab10yr-core`
Cloudflare Worker (API, paywall, metering).

Migrated out of `jneme910/NRCS-Soil-Data-Access/docs` (phased migration, 2026-06-22) to
consolidate the public app surface under the Lab10YR org.

## Layout

- `*.html` — the app/page set (soil-atlas, carbon-risk-map, soil-data-stories,
  county-report, leaderboards, data-center, etc.), served at the site root.
- `js/`, `vendor/`, `assets/` — shared client code, vendored libs, static assets.
- `data/` — JSON/GeoJSON the apps fetch directly (mukey_dcsi/{ST}.json, model_meta.json,
  grids, county data, territory geojsons).

## Data served from R2 (not in this repo)

Heavy map tiles live in the Cloudflare R2 bucket **`lab10yr-mapdata`** and are served by
the Worker (`shouldProxy` in `lab10yr-core/worker.js`): `data/pmtiles/{ST}.pmtiles`,
`data/pmtiles_dcsi/{ST}.pmtiles`, `data/raster/{ST}_900m.pmtiles`, plus
`national_download.csv` and `raw_interp_data.csv`. These are `.gitignore`d here.

## Attribution

National Cooperative Soil Survey · SSURGO · KSSL · Soil Data Access.
