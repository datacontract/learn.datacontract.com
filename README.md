# Data Contracts in Practice: ODCS + ODPS Workshop

Hands-on workshop repository. Prefer a guided, self-paced version? Follow the online tutorial at **[learn.datacontract.com](https://learn.datacontract.com)** (English and German).

Hands-on: put a PostgreSQL dataset under contract with [ODCS](https://bitol-io.github.io/open-data-contract-standard/), describe it as a data product with [ODPS](https://bitol-io.github.io/open-data-product-standard/), and build a derived data product on top using plain SQL.


## Prerequisites

- [Docker](https://www.docker.com/) (with Docker Compose)
- [uv](https://docs.astral.sh/uv/) — used to install the [Data Contract CLI](https://cli.datacontract.com) and the [Entropy Data CLI](https://github.com/entropy-data/entropy-data-cli), see [`scripts/install.sh`](scripts/install.sh)

> [!IMPORTANT]
> **Can't install anything on your laptop?** You can still participate: do the first two exercises directly in the hosted [Data Contract Editor](https://editor.datacontract.com) — it runs entirely in the browser, no installation needed. Use the shared cloud database (see the note in [Exercise 1](exercises/part-a/exercise1-put-your-data-under-contract.md)) instead of the local one.

> [!NOTE]
> **Windows:** Run all commands in **Git Bash** (included with [Git for Windows](https://gitforwindows.org/)) — the exercises use Unix shell features like heredocs (`cat <<EOF`) and pipes that don't work in PowerShell or cmd. Only the helper scripts in `scripts/` have native variants (`.bat`, works in cmd and PowerShell). If an interactive command like `docker compose exec postgres psql ...` fails with "the input device is not a TTY", prefix it with `winpty` or run Git Bash inside [Windows Terminal](https://aka.ms/terminal). WSL 2 works as well.

> [!TIP]
> Conference and hotel Wi-Fi can be painfully slow. Pull the Docker images in advance while you still have a good connection: `docker compose pull`


## Getting Started

Start the database (PostgreSQL on `localhost:5433`, preloaded with e-commerce data):

```
docker compose up -d
```

Connection:

- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `workshop`
- **Username**: `workshop`
- **Password**: `workshop`

It holds two schemas, `orders_v1` and `orders_v2`, each with `orders` and `line_items` tables.

Open a SQL prompt with `docker compose exec postgres psql -U workshop -d workshop`.
To reset the database, run `docker compose down && docker compose up -d`.


## Part A: The Source Data Product

1. [Exercise 1: Put Your Data Under Contract](exercises/part-a/exercise1-put-your-data-under-contract.md) (ODCS)
2. [Exercise 2: Data Contract Evolution](exercises/part-a/exercise2-data-contract-evolution.md) (ODCS)
3. [Exercise 3: Describe Your Data Product](exercises/part-a/exercise3-describe-your-data-product.md) (ODPS)


## Part B: The Consumer-Aligned Data Product

4. [Exercise 4: Design Your Data Product](exercises/part-b/exercise4-design-your-data-product.md) (ODCS + ODPS, contract-first)
5. [Exercise 5: Implement Your Data Product](exercises/part-b/exercise5-implement-your-data-product.md) (SQL view)
6. [Exercise 6: Consumer-Driven Data Contracts](exercises/part-b/exercise6-consumer-driven-data-contracts.md) (ODCS)


## Part C: Automate with CI/CD

Builds on Parts A and B. Needs a GitHub account.

7. [Exercise 7: CI/CD with GitHub Actions](exercises/part-c/exercise7-ci-cd-with-github-actions.md) (Data Contract CLI, Data Product CLI, GitHub Actions)


## Part D: Publish to the Data Platform

8. [Exercise 8: Publish to Entropy Data](exercises/part-d/exercise8-publish-to-entropy-data.md) (Entropy Data CLI)
9. [Exercise 9: Semantics](exercises/part-d/exercise9-semantics.md) (Entropy Data CLI)

No account on [app.entropy-data.com](https://app.entropy-data.com)? Run the [Entropy Data Community Edition](https://github.com/entropy-data/entropy-data-ce) locally with `docker compose -f entropy-data-ce/docker-compose.yaml up -d` (web UI on [http://localhost:8081](http://localhost:8081), set `ENTROPY_DATA_HOST=http://localhost:8081` in your `.env`).


## Links

- [ODCS Docs](https://bitol-io.github.io/open-data-contract-standard/) · [Source (GitHub)](https://github.com/bitol-io/open-data-contract-standard)
- [ODPS Docs](https://bitol-io.github.io/open-data-product-standard/) · [Source (GitHub)](https://github.com/bitol-io/open-data-product-standard)
- [Data Contract CLI (GitHub)](https://github.com/datacontract/datacontract-cli) · [Data Contract Editor](https://editor.datacontract.com) · [Data Product CLI (GitHub)](https://github.com/datacontract/dataproduct-cli)
- [Entropy Data Docs](https://docs.entropy-data.com) · [Entropy Data CLI (GitHub)](https://github.com/entropy-data/entropy-data-cli)


## Trainers

- [Simon Harrer](https://www.linkedin.com/in/simonharrer/)
