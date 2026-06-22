# SQL Examples and Write-up

This markdown page is retained for compatibility.

- [Open themed Examples page](examples.html)
- [Open SQL Explorer](sql-explorer.html)

Representative promoted scripts:

## Example 1: Soil Organic Carbon

- Candidate scripts:
  - `sql/soil-properties/sda_soc_soil_organic_carbon_stock.sql`
  - `sql/soil-properties/sda_soc_weighted_mean_soil_organic_carbon_stock.sql`
- Use when: estimating carbon stock by map unit, state, or reporting area.
- Typical output: weighted SOC metrics and supporting map unit identifiers.

## Example 2: Hydric and Water Table Queries

- Candidate scripts:
  - `sql/hydrology/hydric.sql`
  - `sql/hydrology/water_table_kind_perched_apparent.sql`
- Use when: identifying wetness constraints, hydric conditions, and drainage risk.
- Typical output: hydric classes, minimum depth measures, and related map unit joins.

## Example 3: Geometry and Intersect Workflows

- Candidate scripts:
  - `sql/spatial/sql_server_spatial_point_polygon_example.sql`
  - `sql/spatial/writing_sda_queries_return_geometry.sql`
- Use when: combining geometry operations with tabular SDA data.
- Typical output: map unit geometry with tabular attributes for downstream mapping.

## Example 4: Metrics and Reporting

- Candidate scripts:
  - `sql/metrics/wss_sda_calendar_year_20260219.sql`
  - `sql/metrics/wss_sda_fiscal_year_20260219.sql`
- Use when: reporting SDA/WSS usage trends for monitoring and planning.
- Typical output: counts, acreage, and period-level summary metrics.

## How To Find More

Use the [SQL Explorer](sql-explorer.html) to search all indexed SQL files by:

- keyword
- category
- folder/location
