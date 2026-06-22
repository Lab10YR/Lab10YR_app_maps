# Query Patterns Quick Notes

These notes summarize recurring patterns in this repository.

## Macros

- SDA macros are shorthand declarations expanded before execution.
- Common pattern:
  - `~DeclareChar(@area,20)~`
  - `~DeclareINT(@major)~`
- Recommendation:
  - Keep comments showing equivalent plain SQL declarations for local testing.

## Tabular Functions

- Tabular functions act like virtual tables.
- Typical usage appears in `FROM`/`CROSS APPLY`.
- Example pattern from this repo:
  - `CROSS APPLY SDA_Get_MupolygonWktWgs84_from_Mukey(mapunit.mukey)`

## Common Patterns

### Area filter pattern

- Start with state or survey symbol filter.
- Reduce scope first, then scale.

### Weighted component pattern

- Normalize component percent for map-unit summaries.
- Use weighted rollups for comparable outputs.

### QA flag pattern

- Emit `0/1` flags for rule checks.
- Keep naming explicit (e.g., `*_GE_12`, `has_*`).

### Geometry-return pattern

- Return geometry plus stable keys (`mukey`, `cokey`) for joins.

### Operations validation pattern

- Surface warnings/errors as explicit rows.
- Keep error text actionable for triage.

## Practical checklist before finalizing a query

- Parameters are explicit.
- Filters are intentional and documented.
- Output fields have clear meaning.
- Runtime and row volume are acceptable for the target scope.
