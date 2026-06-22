# Beginner Path

This guide is for first-time Soil Data Access users who want a short path to productive queries.

## Step 1: Hydric classification (easy)

- Script: [sql/hydrology/hydric.sql](../../sql/hydrology/hydric.sql)
- What to learn:
  - mapunit and component joins
  - basic conditional class output
  - area filtering

Suggested first edit:

- Change the area symbol filter and compare output classes.

## Step 2: Return geometry for mapping (easy-to-medium)

- Script: [sql/spatial/writing_sda_queries_return_geometry.sql](../../sql/spatial/writing_sda_queries_return_geometry.sql)
- What to learn:
  - `CROSS APPLY` with SDA geometry function
  - returning geometry plus key attributes
  - using component filters to constrain map units

Suggested first edit:

- Replace `compname like 'Antigo%'` with another component pattern.

## Step 3: SOC aggregation workflow (medium)

- Script: [sql/soil-properties/sda_soc_soil_organic_carbon_stock.sql](../../sql/soil-properties/sda_soc_soil_organic_carbon_stock.sql)
- What to learn:
  - horizon-level calculations
  - component-level and map-unit-level rollups
  - weighted summary patterns

Suggested first edit:

- Change the area scope and review how aggregate totals respond.

## Validation checklist

- Query runs without syntax errors.
- Output includes stable keys (`mukey`, optionally `cokey`).
- Result set is constrained (state/area filter) before scaling up.
- Notes are captured for any assumptions.
