#!/bin/bash
# Uploads the whole ontology (semantics.yaml) in one go and re-publishes the contracts,
# which link their fields to the concepts by IRI (requires the Semantics feature to be enabled).
set -e
cd "$(dirname "$0")"
if [ -f ../../.env ]; then set -a; . ../../.env; set +a; fi

# one PUT replaces the namespace with the document: namespace, concepts, and relationships
curl -sS -f -X PUT "$ENTROPY_DATA_HOST/api/semantics/experimental/namespaces/ecommerce/ontology.yaml" \
  -H "x-api-key: $ENTROPY_DATA_API_KEY" \
  -H "Content-Type: application/yaml" \
  --data-binary @semantics.yaml -w "HTTP %{http_code}\n"
entropy-data semantics concepts list ecommerce

# contracts link the concepts via authoritativeDefinitions (type: semantics, url: the concept's IRI);
# duplicated text descriptions are removed, the definition lives in the concept
datacontract lint orders_v1.with-semantics.odcs.yaml
datacontract lint orders_v2.with-semantics.odcs.yaml
datacontract lint sku_sales_per_year.with-semantics.odcs.yaml
entropy-data datacontracts put orders_v1 --file orders_v1.with-semantics.odcs.yaml
entropy-data datacontracts put orders_v2 --file orders_v2.with-semantics.odcs.yaml
entropy-data datacontracts put sku_sales_per_year --file sku_sales_per_year.with-semantics.odcs.yaml
