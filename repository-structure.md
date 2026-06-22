# Repository Structure

This markdown page is retained for compatibility.

- [Open themed Structure page](repository-structure.html)
- [Open Home page](index.html)
- [Open SQL Explorer](sql-explorer.html)

## Top-Level Layout

- `sql/`: curated entry point and category structure.
- `sandbox/`: broad script inventory and working history.
- `documents/`: tutorials, markdown guides, and supporting references.
- `docs/`: GitHub Pages site and searchable SQL explorer.
- `tools/`: automation helpers such as the SQL index generator.

## SQL Discovery Pipeline

1. Scripts are scanned recursively by `tools/build-sql-index.ps1`.
2. Metadata is generated in `docs/data/sql-index.json`.
3. The `docs/sql-explorer.html` page loads that index for fast search/filter.

## Recommended Workflow

1. Draft and test in `sandbox/`.
2. Promote mature scripts into curated `sql/` categories.
3. Regenerate index after add/rename operations.
4. Update examples/write-up pages when adding notable workflows.
