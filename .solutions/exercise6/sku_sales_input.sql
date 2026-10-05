CREATE SCHEMA IF NOT EXISTS sku_sales_input;

CREATE OR REPLACE VIEW sku_sales_input.orders AS
SELECT order_id, order_timestamp FROM orders_v2.orders;

CREATE OR REPLACE VIEW sku_sales_input.line_items AS
SELECT order_id, sku, quantity FROM orders_v2.line_items;
