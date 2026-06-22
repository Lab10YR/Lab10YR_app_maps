# Choose An Example By Goal

Use this quick matrix to select a starting script.

| Goal                         | Script                                                                                                                                                   | Category        | Notes                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------- |
| Hydric or wetness screening  | [sql/hydrology/hydric.sql](../../sql/hydrology/hydric.sql)                                                                                               | Hydrology       | Fast class-based output for map unit context |
| Water table interpretation   | [sql/hydrology/water_table_kind_perched_apparent.sql](../../sql/hydrology/water_table_kind_perched_apparent.sql)                                         | Hydrology       | Perched vs apparent workflow                 |
| Geometry output for GIS      | [sql/spatial/writing_sda_queries_return_geometry.sql](../../sql/spatial/writing_sda_queries_return_geometry.sql)                                         | Spatial         | Returns WKT geometry with attributes         |
| Point/polygon spatial checks | [sql/spatial/sql_server_spatial_point_polygon_example.sql](../../sql/spatial/sql_server_spatial_point_polygon_example.sql)                               | Spatial         | Basic spatial relationship operators         |
| Carbon stock reporting       | [sql/soil-properties/sda_soc_soil_organic_carbon_stock.sql](../../sql/soil-properties/sda_soc_soil_organic_carbon_stock.sql)                             | Soil Properties | Core SOC rollup pattern                      |
| Weighted SOC summaries       | [sql/soil-properties/sda_soc_weighted_mean_soil_organic_carbon_stock.sql](../../sql/soil-properties/sda_soc_weighted_mean_soil_organic_carbon_stock.sql) | Soil Properties | Depth-range weighted summaries               |
| QA check queries             | [sql/qa/qa_ponding_and_flooding_checks.sql](../../sql/qa/qa_ponding_and_flooding_checks.sql)                                                             | QA              | Flag-driven validation output                |
| Staging completeness checks  | [sql/operations/nasis_to_staging_check_completeness.sql](../../sql/operations/nasis_to_staging_check_completeness.sql)                                   | Operations      | Operational export completeness checks       |
| WSS/SDA usage metrics        | [sql/metrics/wss_sda_calendar_year_20260219.sql](../../sql/metrics/wss_sda_calendar_year_20260219.sql)                                                   | Metrics         | Calendar-year metrics summary                |

## How to use this page

1. Pick one script matching your goal.
2. Run it on a constrained area first.
3. Capture output fields and assumptions.
4. Scale up only after output looks right.
