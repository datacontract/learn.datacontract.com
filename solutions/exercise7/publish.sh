#!/bin/bash
# Publishes all workshop artifacts to Entropy Data.
# Requires ENTROPY_DATA_API_KEY and ENTROPY_DATA_HOST (set via .env in the repository root).
set -e
cd "$(dirname "$0")"
if [ -f ../../.env ]; then set -a; . ../../.env; set +a; fi

entropy-data connection test

# teams must exist before contracts/products that reference them as owner
cat <<EOF | entropy-data teams put order_data_team --file -
id: order_data_team
name: Order Data Team
type: team
description: Owns the orders data
EOF

cat <<EOF | entropy-data teams put purchasing_analytics_team --file -
id: purchasing_analytics_team
name: Purchasing Analytics Team
type: team
description: Builds analytical data products for purchasing
EOF

entropy-data teams list

entropy-data datacontracts put orders_v1 --file ../exercise1/orders_v1.odcs.yaml
entropy-data datacontracts put orders_v2 --file ../exercise2/orders_v2.odcs.yaml
entropy-data datacontracts put sku_sales_per_year --file ../exercise4/sku_sales_per_year.odcs.yaml
entropy-data datacontracts put orders_v2_consumer_sku_sales --file ../exercise6/orders_v2.consumer_sku_sales.odcs.yaml

entropy-data dataproducts put orders --file ../exercise3/orders.odps.yaml

# WORKAROUND for a bug in Entropy Data: ODPS input ports currently (wrongly) require a
# sourceSystemId customProperty - strip the inputPorts section right before publishing
# and model the dependency as an approved access agreement instead.
sed '/^inputPorts:/,/^outputPorts:/{/^outputPorts:/!d;}' ../exercise4/sku_sales_per_year.odps.yaml \
  | entropy-data dataproducts put sku_sales --file -

# status approved + a startDate in the past makes the agreement active (the active flag is computed)
cat <<EOF | entropy-data access put sku_sales_consumes_orders --file -
dataUsageAgreementSpecification: 0.0.1
id: sku_sales_consumes_orders
info:
  purpose: SKU Sales aggregates orders and line items per SKU and year for the purchasing team
  status: approved
  startDate: "2026-01-01"
provider:
  dataProductId: orders
  outputPortId: orders_v2
  dataContractId: orders_v2
consumer:
  dataProductId: sku_sales
EOF

# re-run all contract tests and publish the results to the configured Entropy Data host
export DATACONTRACT_POSTGRES_USERNAME=workshop
export DATACONTRACT_POSTGRES_PASSWORD=workshop
datacontract test ../exercise1/orders_v1.odcs.yaml --publish "${ENTROPY_DATA_HOST:-https://api.entropy-data.com}/api/test-results"
datacontract test ../exercise2/orders_v2.odcs.yaml --publish "${ENTROPY_DATA_HOST:-https://api.entropy-data.com}/api/test-results"
datacontract test ../exercise4/sku_sales_per_year.odcs.yaml --publish "${ENTROPY_DATA_HOST:-https://api.entropy-data.com}/api/test-results"
datacontract test ../exercise6/orders_v2.consumer_sku_sales.odcs.yaml --publish "${ENTROPY_DATA_HOST:-https://api.entropy-data.com}/api/test-results"

entropy-data datacontracts list
entropy-data dataproducts list
entropy-data access list
