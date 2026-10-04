# Exercise 8: Semantics

Right now, the meaning of `order_id`, `order_total`, and `sku` is duplicated across your contracts — every contract carries its own copy of the descriptions. And the descriptions only say what a field *contains*, not what business concept it *is*. In this exercise, you define each concept *once* in **Semantics** — a lightweight business ontology on the platform — and link to it from the contracts you published in Exercise 7.

> **Prerequisite:** This exercise builds on Exercise 7 — your contracts are published and the Entropy Data CLI connection works. If you run the Community Edition from this repository, Semantics is already enabled.

## Model the Business Concepts

1. Create the business entities, each with its properties:

   ```bash
   printf 'name: Main\n' | entropy-data semantics namespaces put main --file -

   cat <<EOF | entropy-data semantics concepts put main order --file -
   name: Order
   kind: entity
   description: A customer order in the e-commerce platform
   properties:
   - id: order_id
     name: Order ID
     kind: property
     description: Unique identifier of an order (UUID)
     data_type: string
     required: true
     unique: true
   - id: order_total
     name: Order Total
     kind: property
     description: Total amount of an order in cents, never negative
     data_type: integer
   EOF

   cat <<EOF | entropy-data semantics concepts put main article --file -
   name: Article
   kind: entity
   description: A product that can be bought in the e-commerce platform
   properties:
   - id: sku
     name: SKU
     kind: property
     description: Stock keeping unit, the unique identifier of an article
     data_type: string
     required: true
     unique: true
   EOF
   ```

2. Relate the entities to each other — an order contains articles:

   ```bash
   cat <<EOF | entropy-data semantics relationships put main order-contains-article --file -
   type: relatedTo
   name: contains
   description: An order contains one or more articles
   roles:
   - concept: order
   - concept: article
   verbalizes:
   - "{Order} contains {Article}"
   EOF
   ```

## Link Your Data Contracts

3. Link the concepts from your data contracts with `authoritativeDefinitions` — and remove the now-duplicated descriptions from the contract fields, the definition lives in one place. An entity's property is addressed as `<entity>.<property>`:

   ```yaml
   schema:
     - name: orders
       authoritativeDefinitions:
         - type: semantics
           url: /acme/semantics/main/order
       properties:
         - name: order_id
           authoritativeDefinitions:
             - type: semantics
               url: /acme/semantics/main/order.order_id
   ```

   Do the same for `order_total` (`order.order_total`, in all contracts that have it) and `sku` (`article.sku`).

   > The URLs are host-relative on purpose: they resolve on whatever instance the contract lives on, cloud or local Community Edition. Replace `acme` with your organization name.

4. Re-publish the changed contracts:

   ```bash
   entropy-data datacontracts put orders_v1 --file orders_v1.odcs.yaml
   entropy-data datacontracts put orders_v2 --file orders_v2.odcs.yaml
   entropy-data datacontracts put sku_sales_per_year --file sku_sales_per_year.odcs.yaml
   ```

## Explore the Ontology

5. Open a concept's page in **Studio > Semantics**: the reverse lookup shows every data contract that links to it — "which datasets contain order totals?" is now one click. Switch to the **Diagram** view to see the ontology as a graph.
