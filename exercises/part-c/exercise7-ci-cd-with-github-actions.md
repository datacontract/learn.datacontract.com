# Exercise 7: CI/CD with GitHub Actions

Your contracts are only tested when someone runs `datacontract test`.
Now you automate it: every push lints and tests all contracts, and every pull request is checked for **breaking changes** before it is merged.

Builds on Parts A and B only. You need a [GitHub](https://github.com) account.


## Push Your Work to Your Own Fork

1. Fork the workshop repository on GitHub: open [github.com/datacontract/learn.datacontract.com](https://github.com/datacontract/learn.datacontract.com) and click **Fork**.
   Then point your local clone to your fork (with the [GitHub CLI](https://cli.github.com), `gh repo fork --remote` does both steps in one go):

   ```bash
   git remote rename origin upstream
   git remote add origin https://github.com/<your-username>/learn.datacontract.com.git
   ```

2. The workshop repository ignores the files you created in the exercises. In your fork, they are your source code. Open [`.gitignore`](/.gitignore) and **delete the last block** (the comment `# files created during the exercises` and the five lines below it).

3. Save the SQL of your views from Exercises 5 and 6 as files, so the pipeline can create them:

   - `sql/sku_sales_input.sql`: the `sku_sales_input` schema with the two access views (Exercise 6)
   - `sql/sku_sales_per_year.sql`: the `analytics.sku_sales_per_year` view (rebased version from Exercise 6)

   Each file must run on an empty database: start with `CREATE SCHEMA IF NOT EXISTS ...` and use `CREATE OR REPLACE VIEW`.

4. Commit and push:

   ```bash
   git add .gitignore sql/ *.odcs.yaml *.odps.yaml
   git commit -m "Add data contracts, data products, and views"
   git push -u origin main
   ```

   > [!WARNING]
   > Your fork is public. Never commit an API key: if you ever add `ENTROPY_DATA_API_KEY` to `.env` (Part D), remove it before committing (`git diff .env`).

5. GitHub disables workflows in forks by default: open the **Actions** tab of your fork and click **I understand my workflows, go ahead and enable them**.


## Lint on Every Push

6. Create `.github/workflows/datacontract.yml`:

   ```yaml
   name: Data Contracts

   on:
     push:
       branches: [main]
     pull_request:

   env:
     COLUMNS: 200 # wider tables in the logs

   jobs:
     test:
       name: Lint and test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v7

         - uses: astral-sh/setup-uv@v10.2.0

         - name: Install the CLIs
           run: |
             uv tool install --python 3.11 'datacontract-cli[postgres]==1.2.3'
             uv tool install --python 3.11 'dataproduct-cli==0.3.1'

         - name: Lint data contracts
           run: |
             for file in *.odcs.yaml; do
               datacontract lint "$file"
             done

         - name: Lint data products
           run: |
             for file in *.odps.yaml; do
               dataproduct lint "$file"
             done
   ```

   Linting checks that every file is valid ODCS or ODPS. `dataproduct lint` also checks that the data contracts linked in the ports exist in the repository. No database needed.

7. Commit, push, and watch the run in the **Actions** tab. It should turn green.

8. Break it on purpose: in `orders_v1.odcs.yaml`, change the `logicalType` of `order_id` to `text` (not an ODCS logical type), push, and look at the failing run. Revert afterward.


## Test Against the Database

Linting checks the *syntax*. Now check *reality*: the pipeline starts the workshop database, creates your views, and tests every contract against it.

9. Add these steps to the `test` job:

   ```yaml
         - name: Start the database
           run: docker compose up -d --wait

         - name: Create the views
           run: |
             docker compose exec -T postgres psql -U workshop -d workshop -v ON_ERROR_STOP=1 < sql/sku_sales_input.sql
             docker compose exec -T postgres psql -U workshop -d workshop -v ON_ERROR_STOP=1 < sql/sku_sales_per_year.sql

         - name: Test data contracts
           run: datacontract ci *.odcs.yaml
   ```

   `datacontract ci` works like `datacontract test`, but is made for pipelines: it tests several contracts in one go, writes a summary to the run page, and annotates failed checks on the contract files. The database credentials come from the `.env` file in the repository.

10. Push and open the run: scroll down to the **summary** with the results of all checks.

11. Make a test fail: in `sku_sales_per_year.odcs.yaml`, change the `physicalType` of `total_quantity` to `integer` and push. Find the annotation on the run page. Revert afterward.

> [!NOTE]
> The database in the pipeline is a stand-in. In a real setup, the pipeline tests a staging environment before each deployment. A scheduled workflow (`on: schedule:` with a cron expression) tests production regularly, because data can break without any code change.


## Stop Breaking Changes in Pull Requests

A breaking change in a contract breaks consumers. The pipeline catches it *before* the merge: it compares each contract in a pull request with its version on the base branch.

12. Add a second job to the workflow:

    ```yaml
      breaking-changes:
        name: Breaking changes
        if: github.event_name == 'pull_request'
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v7
            with:
              fetch-depth: 0 # the base branch is needed for the comparison

          - uses: astral-sh/setup-uv@v10.2.0

          - name: Install the CLI
            run: uv tool install --python 3.11 'datacontract-cli[postgres]==1.2.3'

          - name: Compare with the base branch
            env:
              BASE: origin/${{ github.base_ref }}
            run: |
              status=0
              # every contract on the base branch must stay compatible (new contracts have nothing to compare)
              for file in $(git ls-tree --name-only "$BASE" | grep '\.odcs\.yaml$'); do
                if [ ! -f "$file" ]; then
                  echo "::error file=$file::Data contract $file was removed"
                  status=1
                  continue
                fi
                git show "$BASE:$file" > "$RUNNER_TEMP/$file"
                if ! datacontract breaking "$RUNNER_TEMP/$file" "$file"; then
                  echo "::error file=$file::Breaking change in $file. Release a new major version instead."
                  status=1
                fi
              done
              exit $status
    ```

    Try `datacontract breaking` locally first, e.g. to compare your two orders contracts: `datacontract breaking orders_v1.odcs.yaml orders_v2.odcs.yaml`. It exits with a non-zero code when it finds a breaking change.

13. Commit and push the workflow to `main`.

14. Now be the orders team who wants to "clean up" a column. Create a branch, remove the `customer_id` property from `orders_v2.odcs.yaml`, and push the branch:

    ```bash
    git switch -c remove-customer-id
    # remove customer_id from the orders schema in orders_v2.odcs.yaml
    git commit -am "Remove customer_id"
    git push -u origin remove-customer-id
    ```

15. Open a pull request **in your fork**.

    > [!IMPORTANT]
    > GitHub proposes the original workshop repository as the base of a pull request from a fork. Change the **base repository** to `<your-username>/learn.datacontract.com`, base `main`.

    The **Breaking changes** check fails, and the annotation points at `orders_v2.odcs.yaml`.

16. Do it properly instead: revert the removal, and make a *compatible* change, e.g., add a `description` to `customer_id` or a new tag. Push to the same branch and watch the check turn green.
    A change that consumers must adapt to needs a new major version: a new contract, like `orders_v2` for `orders_v1`.


## Bonus

- Make the checks mandatory: in your fork's **Settings → Rules → Rulesets**, require the status checks **Lint and test** and **Breaking changes** for `main`. Now a breaking change can't be merged anymore.
- Remember the consumer-driven contract from [Exercise 6](../part-b/exercise6-consumer-driven-data-contracts.md)? It is tested in the same pipeline. In a real setup, the orders team runs the contracts of *all their consumers* in their pipeline. So they see exactly whom a change would break.
- Publish the test results to Entropy Data (Part D): add your API key as repository secret `ENTROPY_DATA_API_KEY` (**Settings → Secrets and variables → Actions**) and change the test step to:

  ```yaml
        - name: Test data contracts
          run: datacontract ci *.odcs.yaml --publish https://api.entropy-data.com/api/test-results
          env:
            ENTROPY_DATA_API_KEY: ${{ secrets.ENTROPY_DATA_API_KEY }}
  ```

  Running Entropy Data locally (Community Edition)? GitHub can't reach your laptop, so this only works with the cloud.
- Linked your contracts to semantic concepts (Exercise 9)? The CLI resolves these links on the Entropy Data host during `ci`. Add `--no-inline-references` to the test step if the pipeline can't reach it.
- **Schedule production tests with Airflow:** CI tests a contract when it changes, but the data changes every day. The [Data Contract provider for Airflow](https://github.com/datacontract/airflow-provider-datacontract) adds a `DataContractTestOperator` that runs `datacontract test` as a quality gate in your DAGs. See the [scheduling docs for Airflow](https://docs.datacontract.com/scheduling/airflow).
