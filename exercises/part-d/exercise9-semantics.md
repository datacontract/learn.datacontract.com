# Exercise 9: Semantics

Right now, the meaning of `order_id`, `order_total`, and `sku` is duplicated across your contracts: every contract carries its own copy of the descriptions. And the descriptions only say what a field *contains*, not what business concept it *is*. In this exercise, you define each concept *once* in an ontology file with stable **IRIs**, upload it to **Semantics** on the platform in one go, and link to it from the contracts you published in Exercise 7.

> **Prerequisite:** This exercise builds on Exercise 8: your contracts are published and the Entropy Data CLI connection works. If you run the Community Edition from this repository, Semantics is already enabled.

An IRI is a globally unique, stable name for a concept, e.g. `https://learn.datacontract.com/ontology/ecommerce#sku`. It does not depend on the platform's host or your organization name, so the same contract links correctly on any instance. It does not need to be a reachable web page: the platform resolves it to the concept that carries it.

## Write the Ontology

1. Create `semantics.yaml` in the repository root. It holds the complete namespace `ecommerce`: the `ecom:` prefix for the IRI base, the entities Order and Article (`EntityType`), their properties Order ID, Order Total, and SKU (`ValueType`, attached with `hasProperty`), and the relationship *an order contains articles* (`relatedTo`):

   ```yaml
   version: 0.2.0.dev0
   name: ecommerce
   description: Business concepts of the e-commerce platform.
   custom_properties:
     display_name: E-Commerce
   prefixes:
     ecom: https://learn.datacontract.com/ontology/ecommerce#
   ontology:
     - concept: Order
       id: order
       type: EntityType
       description: A customer order in the e-commerce platform.
       iri: ecom:Order
       relationships:
         - id: order_has_order_id
           name: order_id
           type: hasProperty
           roles:
             - concept: Order ID
         - id: order_has_order_total
           name: order_total
           type: hasProperty
           roles:
             - concept: Order Total
         - id: order_contains_article
           name: contains
           type: relatedTo
           description: An order contains one or more articles.
           roles:
             - concept: Article
           verbalizes:
             - "{Order} contains {Article}"
     - concept: Article
       id: article
       type: EntityType
       description: A product that can be bought in the e-commerce platform.
       iri: ecom:Article
       relationships:
         - id: article_has_sku
           name: sku
           type: hasProperty
           roles:
             - concept: SKU
     - concept: Order ID
       id: order_id
       type: ValueType
       description: Unique identifier of an order (UUID).
       iri: ecom:orderId
     - concept: Order Total
       id: order_total
       type: ValueType
       description: Total amount of an order in cents, never negative.
       iri: ecom:orderTotal
     - concept: SKU
       id: sku
       type: ValueType
       description: Stock keeping unit, the unique identifier of an article.
       iri: ecom:sku
   ```

2. Upload the whole file in one go. One `PUT` creates the namespace, all concepts, and all relationships (the Entropy Data CLI has no command for this yet, so call the API with the key and host from your `.env`):

   ```bash
   set -a; source .env; set +a
   curl -sS -f -X PUT "$ENTROPY_DATA_HOST/api/semantics/experimental/namespaces/ecommerce/ontology.yaml" \
     -H "x-api-key: $ENTROPY_DATA_API_KEY" \
     -H "Content-Type: application/yaml" \
     --data-binary @semantics.yaml -w "HTTP %{http_code}\n"
   entropy-data semantics concepts list ecommerce
   ```

   To change the ontology later, edit the file and upload it again. Concepts you remove from the file are removed from the namespace.

## Link Your Data Contracts

3. Link the concepts from your data contracts with `authoritativeDefinitions` of type `semantics`, using the full IRI as `url`, and remove the now-duplicated descriptions from the contract fields:

   ```yaml
   schema:
     - name: orders
       authoritativeDefinitions:
         - type: semantics
           url: https://learn.datacontract.com/ontology/ecommerce#Order
       properties:
         - name: order_id
           authoritativeDefinitions:
             - type: semantics
               url: https://learn.datacontract.com/ontology/ecommerce#orderId
   ```

   Do the same for `order_total` (`...#orderTotal`, in all contracts that have it) and `sku` (`...#sku`).

   > `datacontract test` resolves the IRIs through `ENTROPY_DATA_HOST` (`/api/semantics?iri=...`) and needs `ENTROPY_DATA_API_KEY` for it. Without access to the platform, add `--no-inline-references`.

4. Re-publish the changed contracts:

   ```bash
   entropy-data datacontracts put orders_v1 --file orders_v1.odcs.yaml
   entropy-data datacontracts put orders_v2 --file orders_v2.odcs.yaml
   entropy-data datacontracts put sku_sales_per_year --file sku_sales_per_year.odcs.yaml
   ```

## Explore the Ontology

5. Open **Semantics → E-Commerce → Article → SKU** in the web UI: the diagram shows the ontology, **Metadata** shows the concept's IRI, and **Data Products** is the reverse lookup: "which data products contain SKUs?" is now one click. The data product list shows the linked concepts in the **Semantics** column.
