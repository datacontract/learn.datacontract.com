# Exercise 7: Publish to Entropy Data

YAML files in a Git repository work well for a single team — but how do *other* teams discover your data products, browse the contracts, and request access? For that you need a data product platform. In this exercise, you publish everything you built in Part A and Part B to [Entropy Data](https://entropy-data.com) using the [Entropy Data CLI](https://github.com/entropy-data/entropy-data-cli).

## Get Access

1. Go to [app.entropy-data.com](https://app.entropy-data.com), create an account, and set up your own organization, named `workshop-<yourfirstname>` (e.g., `workshop-simon`). Organization names are unique across the platform, so the suffix avoids collisions with your fellow participants. Use lowercase letters, digits, and hyphens only. The examples below use `workshop`.

   > **No cloud account?** Run the [Entropy Data Community Edition](https://github.com/entropy-data/entropy-data-ce) locally instead: `docker compose -f entropy-data-ce/docker-compose.yaml up -d`, then `./scripts/setup-entropy-data-ce.sh` (Windows: `scripts\setup-entropy-data-ce.bat`) — it creates the account, the organization, and the API key, and writes them to your `.env` (steps 1, 2, and 4 done). Log in at [http://localhost:8081](http://localhost:8081) with `workshop@example.com` / `workshop`.

2. Go to the organization settings and create an API key (organization write permissions).
3. Install the Entropy Data CLI (already installed if you ran [`scripts/install.sh`](/scripts/install.sh)):

   ```bash
   uv tool install entropy-data
   entropy-data --version
   ```

4. Configure the connection: add your API key to the `.env` file in the repository root (the Entropy Data CLI picks it up automatically; note that `.env` is tracked in git, so take care not to commit your API key):

   ```bash
   # .env
   ENTROPY_DATA_API_KEY=ed_...
   ENTROPY_DATA_HOST=https://api.entropy-data.com
   ```

   Verify the connection:

   ```bash
   entropy-data connection test
   ```

## Create Your Teams

5. Contracts and data products reference a team as their owner — and Entropy Data requires the team to exist before you can publish anything that references it. Create your teams upfront:

   ```bash
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
   ```

   The `team.name` in your ODCS/ODPS files must match the team ID (e.g., `order_data_team`).

## Publish Your Data Contracts

6. Publish all your data contracts. The ID argument must match the `id` field inside the contract:

   ```bash
   entropy-data datacontracts put orders_v1 --file orders_v1.odcs.yaml
   entropy-data datacontracts put orders_v2 --file orders_v2.odcs.yaml
   entropy-data datacontracts put sku_sales_per_year --file sku_sales_per_year.odcs.yaml
   entropy-data datacontracts put orders_v2_consumer_sku_sales --file orders_v2.consumer_sku_sales.odcs.yaml
   ```

7. Check that they are there:

   ```bash
   entropy-data datacontracts list
   ```

## Publish Your Data Products

Entropy Data natively supports ODPS, so you can publish your data product files as they are.

8. Publish both data products. The ID argument must match the `id` field inside your ODPS file:

   ```bash
   entropy-data dataproducts put orders --file orders.odps.yaml
   entropy-data dataproducts put sku_sales --file sku_sales_per_year.odps.yaml
   ```

   > **Workaround:** Due to a current bug in Entropy Data, publishing fails if the ODPS file contains `inputPorts`. Remove the `inputPorts` section from `sku_sales_per_year.odps.yaml` right before publishing.

9. Check that they are there:

   ```bash
   entropy-data dataproducts list
   ```

## Connect the Data Products

10. On the platform, the dependency between the two data products is an **access agreement**: the SKU Sales product consumes the `orders_v2` output port of the Orders product. Create it directly in the approved state:

    ```bash
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
    ```

    With `status: approved` and a `startDate` in the past, the agreement is active.

## Explore the Platform

11. Open [app.entropy-data.com](https://app.entropy-data.com) and explore what the platform made out of your YAML files:
 
    - Find your two data products and their output ports
    - Open the `sku_sales_per_year` contract and compare it with the editor view
    - Follow the access agreement from the SKU Sales product to the Orders product — the dependency you declared in Exercise 4 is now a navigable link in the data product map
    - Look at your colleagues' data products: how would you find a data product about SKUs if you didn't know it existed?

## Publish Test Results

12. The platform shows whether a contract is *currently* upheld — if you feed it test results. Run your local tests again and publish the results:

    ```bash
    datacontract test sku_sales_per_year.odcs.yaml --publish https://api.entropy-data.com/api/test-results
    ```

    The CLI sends the API key from your `.env` along, as the URL is on the `ENTROPY_DATA_HOST`. Running the Community Edition? Use `--publish http://localhost:8081/api/test-results` instead.

    Find the test results on the contract page in the UI.

## Bonus

- Keep git as the source of truth: explore `entropy-data datacontracts import-from-git --help` and think about how you would wire this up in a CI/CD pipeline
- Publish test results automatically on every push: have a look at `datacontract ci --help`
