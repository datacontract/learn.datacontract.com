# Solutions

Reference solutions for verification purposes only, one folder per exercise. Try the exercises yourself first!

Each folder shows the **end state of its exercise**. Two lifecycle transitions are not snapshotted: after exercise 2, `orders_v1` is set to `retired` (the `exercise1/` solution keeps the end state of exercise 1, `active`), and at the end of exercise 5, the `sku_sales_per_year` contract and data product are set to `active` (the `exercise4/` solutions keep the `draft` state from the design phase).

Run `./solutions/test_all.sh` from the repository root to recheck all solutions sequentially, exercise by exercise. Set `ENTROPY_DATA_API_KEY` and `ENTROPY_DATA_HOST` in `.env` to also run the publish steps of exercises 8 and 9.

The `exercise7/` folder contains the GitHub Actions workflow `datacontract.yml`. In your fork, it goes to `.github/workflows/datacontract.yml`. It runs on GitHub only and is not covered by `test_all.sh`.
