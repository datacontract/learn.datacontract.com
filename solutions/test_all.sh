#!/bin/bash
# Rechecks the reference solutions sequentially, exercise by exercise,
# covering the commands of each exercise (including expected failures and bonus commands).
set -e
cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
export DATACONTRACT_POSTGRES_USERNAME="${DATACONTRACT_POSTGRES_USERNAME:-workshop}"
export DATACONTRACT_POSTGRES_PASSWORD="${DATACONTRACT_POSTGRES_PASSWORD:-workshop}"

check_odps() {
  echo "=== Validating $1 ==="
  dataproduct lint "$1"
}

psql_cmd() {
  docker compose exec -T postgres psql -U workshop -d workshop -v ON_ERROR_STOP=1 "$@"
}

expect_fail() {
  if "$@" > /dev/null 2>&1; then
    echo "ERROR: expected this command to fail, but it succeeded: $*"
    exit 1
  fi
  echo "=== Failed as expected: $* ==="
}

# start from a clean slate, as participants do
psql_cmd -c "DROP SCHEMA IF EXISTS analytics CASCADE; DROP SCHEMA IF EXISTS sku_sales_input CASCADE;" > /dev/null

echo "### Exercise 1: contract for orders_v1"
# step 3: explore the data
psql_cmd -c '\dt orders_v1.*' -c 'SELECT * FROM orders_v1.orders LIMIT 5;' -c 'SELECT * FROM orders_v1.line_items LIMIT 5;' > /dev/null
datacontract lint solutions/exercise1/orders_v1.odcs.yaml
datacontract test solutions/exercise1/orders_v1.odcs.yaml
# step 10: verify tests can also fail (broken physicalType)
sed 's/^  - name: customer_email_address$/  - name: customer_email_address_renamed/' \
  solutions/exercise1/orders_v1.odcs.yaml > /tmp/orders_v1.broken.odcs.yaml
expect_fail datacontract test /tmp/orders_v1.broken.odcs.yaml
# bonus: export and catalog
datacontract export html solutions/exercise1/orders_v1.odcs.yaml --output /tmp/orders_v1.odcs.html
datacontract export sql solutions/exercise1/orders_v1.odcs.yaml > /dev/null
datacontract catalog --files 'solutions/exercise*/*.odcs.yaml' --output /tmp/datacontract-catalog > /dev/null

echo "### Exercise 2: contract for orders_v2"
# explore the new version
psql_cmd -c '\dt orders_v2.*' -c 'SELECT * FROM orders_v2.orders LIMIT 5;' -c 'SELECT * FROM orders_v2.line_items LIMIT 5;' > /dev/null
datacontract lint solutions/exercise2/orders_v2.odcs.yaml
datacontract test solutions/exercise2/orders_v2.odcs.yaml

echo "### Exercise 3: data product for orders"
check_odps solutions/exercise3/orders.odps.yaml

echo "### Exercise 4: design contract + data product for sku_sales (contract-first)"
datacontract lint solutions/exercise4/sku_sales_per_year.odcs.yaml
check_odps solutions/exercise4/sku_sales_per_year.odps.yaml
# step 4: the tests fail - nothing is implemented yet
expect_fail datacontract test solutions/exercise4/sku_sales_per_year.odcs.yaml

echo "### Exercise 5: implement the view, tests turn green"
psql_cmd < solutions/exercise5/sku_sales_per_year.sql
datacontract test solutions/exercise4/sku_sales_per_year.odcs.yaml
# exercise 5 ends with setting status to active in the contract and the ODPS file;
# the exercise4/ solutions keep the draft state from the design phase

echo "### Exercise 6: consumer-driven contract + input views, rebase the product view"
datacontract lint solutions/exercise6/orders_v2.consumer_sku_sales.odcs.yaml
# step 5: the tests fail - the input views do not exist yet
expect_fail datacontract test solutions/exercise6/orders_v2.consumer_sku_sales.odcs.yaml
psql_cmd < solutions/exercise6/sku_sales_input.sql
datacontract test solutions/exercise6/orders_v2.consumer_sku_sales.odcs.yaml
psql_cmd < solutions/exercise6/sku_sales_per_year.sql
datacontract test solutions/exercise4/sku_sales_per_year.odcs.yaml

if [ -n "$ENTROPY_DATA_API_KEY" ]; then
  echo "### Exercise 7: publish to Entropy Data"
  ./solutions/exercise7/publish.sh
  echo "### Exercise 8: semantics"
  if ! ./solutions/exercise8/semantics.sh; then
    echo "Semantics not enabled - skipping exercise 8"
  fi
else
  echo "### Exercises 7+8: skipped (set ENTROPY_DATA_API_KEY and ENTROPY_DATA_HOST in .env to publish)"
fi

echo "All checks passed."
