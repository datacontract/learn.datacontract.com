-- Rebased onto the consumer-driven input views (exercise 6)
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.sku_sales_per_year AS
SELECT
    li.sku,
    EXTRACT(YEAR FROM o.order_timestamp)::int AS year,
    COUNT(*)::bigint                          AS order_count,
    SUM(li.quantity)::bigint                  AS total_quantity
FROM sku_sales_input.line_items li
JOIN sku_sales_input.orders o ON li.order_id = o.order_id
GROUP BY li.sku, EXTRACT(YEAR FROM o.order_timestamp);
