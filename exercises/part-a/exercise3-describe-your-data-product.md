# Exercise 3: Describe Your Data Product

The data contracts from [Exercise 1](exercise1-put-your-data-under-contract.md) and [Exercise 2](exercise2-data-contract-evolution.md) describe the *interface* of your data.
But consumers also want to know about the **data product** behind it:
who owns it, what it is for, and which contracts it offers.
That is what the [Open Data Product Standard] (ODPS) is for.

Note that there is *one* data product — even though it currently offers *two* contract versions.
The product is the stable unit of ownership; its ports evolve.


## Create the Data Product

1. Create a new file `orders.odps.yaml` with this skeleton:

   ```yaml
   apiVersion: v1.1.0
   kind: DataProduct
   id: orders # snake_case of the name
   name: Orders
   version: 1.0.0 # the version of the data product, independent of the contract versions
   status: active
   type: sourceAligned # new in ODPS 1.1: sourceAligned, aggregate, or consumerAligned
   domain: ecommerce
   description:
     purpose: # what is this data product for?
     limitations: # what should consumers know before using it?
   ```

   Replace the `purpose` and `limitations` comments with real text.

2. Add an **output port** per data contract.
   The `contractId` must match the `id` of the respective data contract.
   Entropy Data reads a display name and the server connection from `customProperties`:

   ```yaml
   outputPorts:
     - name: orders_v1
       description: Orders and line items tables in PostgreSQL (v1, superseded by v2)
       version: 1.0.0
       contractId: orders_v1
     - name: orders_v2
       description: # ...
       version: 2.0.0
       contractId: orders_v2
   ```

3. Add `team` and `support` — you can reuse what you defined in the contracts:

   ```yaml
   team:
     name: order_data_team
     members:
       - username: owner@example.com
         role: Owner

   support:
     - channel: "#order-data-help"
       url: https://example.slack.com/archives/order-data-help
       tool: slack
   ```

## Validate

4. Validate your data product description with the [Data Product CLI](https://github.com/datacontract/dataproduct-cli). It checks the file against the official ODPS JSON schema:

   ```bash
   dataproduct lint orders.odps.yaml
   ```

[Open Data Product Standard]: <https://bitol-io.github.io/open-data-product-standard/latest/>
