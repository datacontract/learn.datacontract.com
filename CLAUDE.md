@AGENTS.md

# Maintaining this repository

Everything below is for maintainers changing the workshop or the online tutorial. When helping a workshop participant, the rule in AGENTS.md applies: do not read or quote `solutions/`.

## What lives here

- **Online tutorial** at https://learn.datacontract.com: `tutorial/`, a self-paced SPA in English and German. Deployed by `.github/workflows/tutorial.yml` to GitHub Pages on every push to `main` (only in `datacontract/learn.datacontract.com`). The custom domain is configured in the GitHub Pages settings; DNS is a proxied CNAME at Cloudflare.
- **On-site workshop**: `README.md`, `exercises/part-*/`, used with slides (intro and retro are on the slides, not in the repo).
- **Shared**: `solutions/` (reference solutions, also embedded in the tutorial), `initdb/` + `data/` (PostgreSQL sample data), `scripts/` (install and Community Edition setup), `schemas/` (official JSON schemas), `entropy-data-ce/`.
- **Walkthrough videos**: `video/` records one video per tutorial chapter (see `video/README.md`).
- The data2day 2026 version lives in a separate repo, `simonharrer/odcs-odps-workshop` (no SPA).

Online and on-site use the same numbering: Part C is CI/CD (exercise 7), Part D is the data platform (exercise 8 publish, exercise 9 semantics). Solution folders follow these numbers.

## Versions (keep in sync everywhere)

- datacontract-cli `1.2.3`, dataproduct-cli `0.3.1`, entropy-data `0.3.13`: pinned in `scripts/install.sh`, `install.ps1`, `install.bat`, and in `solutions/exercise7/datacontract.yml`.
- ODCS `v3.2.0` and ODPS `v1.1.0` in all solutions, examples, and `schemas/` (mapped in `.vscode/settings.json`).
- GitHub Actions: `actions/checkout@v7`, `astral-sh/setup-uv@v10.2.0` (setup-uv has no floating major tags).
- When bumping a CLI, re-capture the terminal outputs in the tutorial and re-record the affected videos.

## Writing rules

- No em dashes anywhere. Keep text concise.
- English and German versions must stay equivalent. German uses informal "du"; CLI flags, YAML keys, and UI labels stay English.
- Screenshots are WebP (`cwebp -q 85`) in `tutorial/public/screenshots/`. Only the social image `tutorial/public/og-image.png` is PNG.
- The Entropy Data Community Edition organization is `acme` (`workshop` and `tutorial` are reserved names). Never put API keys into the tracked `.env`; the tutorial tells participants to `export` them.
- Online tutorial: no "ask the trainer", no shared cloud database credentials, no GitHub Codespaces.

## Tutorial architecture

- Vite, React 19, TypeScript, Tailwind 4, MDX. Content in `tutorial/src/content/{en,de}/<slug>.mdx`; chapters, parts, durations, and the `video` flag in `tutorial/src/chapters.ts`; UI strings in `tutorial/src/i18n.ts`.
- Real URLs: `/en/` (welcome), `/en/<slug>/`, same for `/de/`. Old `#/...` links are redirected in `src/main.tsx`.
- `npm run build` typechecks, builds the client, builds `src/entry-server.tsx` for SSR, and runs `scripts/prerender.mjs`. That script prerenders every page to static HTML (hydrated in the browser) with title, description, canonical, hreflang, Open Graph, and JSON-LD (Course, HowTo, VideoObject, BreadcrumbList), and writes `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, and a Markdown version of every page (`scripts/mdx-to-md.mjs`). Components must be SSR-safe: no `window`, `document`, `localStorage`, or `navigator` during render; read browser state in effects.
- Progress, theme, and OS choice are stored in localStorage. Progress is keyed by chapter slug and step id.
- Umami analytics is loaded in `tutorial/index.html`; it tracks page changes via `history.pushState` itself.

## Authoring MDX chapters

- No leading H1 (title and summary come from `chapters.ts`). Structure: intro, `<Goals>`, `##` sections with `<Step id title>`, concept callouts, solution, one quiz, bonus.
- `<Step id="...">` ids are literal, unique per chapter, and identical in EN and DE. Changing an id resets participants' progress for that step.
- Every terminal command is a ```` ```bash ```` block directly followed by a ```` ```powershell ```` block (Windows = native PowerShell, not Git Bash); the build fails otherwise (`plugins/remark-terminal.ts`). An optional ```` ```output ```` block right after the pair shows the example output in the terminal window.
- Outputs must be real: run the commands with the pinned CLIs against the workshop database, strip ANSI codes, and trim long output with a `…` line.
- Include reference solutions instead of copying them: ```` ```yaml file=../../../../solutions/exercise1/orders_v1.odcs.yaml ````.
- Components: `<Callout type="note|tip|warning|concept" title>`, `<OsTabs><Os name="unix|windows">` (only for prose that differs per OS), `<Solution title>`, `<Quiz question options answer feedback>` (`feedback` has one explanation per option, shown when that wrong option is picked), `<ScenarioDiagram variant="all|contract|evolution|data-product|contract-first|implement|consumer-driven" />` (drawn like the Entropy Data map; arrows point from consumer to provider; each of exercises 1 to 6 shows its variant after the intro), markdown images.
- Links between chapters: `/en/<slug>/` (absolute). Images: `![Caption](/screenshots/name.webp)`; the alt text is the caption.

## Facts the content relies on

- Workshop database: PostgreSQL on `localhost:5433`, database `workshop`, user and password `workshop`, schemas `orders_v1` and `orders_v2`. The data is a static snapshot from 2020-01-01 to 2025-09-13, so a `freshness` SLA check always fails (the contract chapter shows this on purpose); `retention` with `element: orders.order_timestamp` and 10 years passes.
- Only `freshness` and `retention` SLA properties with an `element` become checks; `frequency` and `latency` are documentation.
- Verified statement answers used in the content: 876 orders in 2023; top SKUs by units in 2024: D3KT74L5EV46T (146), IWMJ3ZX164 (62), TFH11HYOR (46).
- `datacontract breaking` exits 1 on ERROR (removed field, type change, added `required`); adding a column is INFO. `datacontract ci` writes GitHub annotations and the step summary.
- Semantics: one ontology file (`solutions/exercise9/semantics.yaml`, prefix `ecom: https://learn.datacontract.com/ontology/ecommerce#`) uploaded with `PUT /api/semantics/experimental/namespaces/{ns}/ontology.yaml`; the entropy-data CLI has no command for it.
- The hosted Data Contract Editor (editor.datacontract.com) runs tests via `api.datacontract.com`, which has credentials for the public Supabase copy (host `aws-1-eu-central-2.pooler.supabase.com`, port `6543`, database `postgres`, schemas `orders_v1`, `orders_v2`).
- Participants remove the last `.gitignore` block (`# files created during the exercises`) in their fork before committing for the CI/CD exercise.

## Videos

- `cd video && npm install && node record.mjs <slug>` writes `tutorial/public/videos/<slug>.{mp4,webp,en.vtt,de.vtt}` and updates `videos.json` (durations for the structured data). Scenes are in `video/scenes/<slug>.mjs`; terminal scenes read commands and outputs from the English MDX (`lib/mdx.mjs`), so re-record after changing commands or outputs.
- Live browser scenes start the Data Contract Editor with the pinned CLI (`lib/browser.mjs`); Part D scenes need a local Community Edition. CI screenshots come from the private demo repo `simonharrer/learn-ci-demo`.

## Before committing

- `cd tutorial && npm run build` (typecheck, build, prerender) passes.
- `grep -r "—" tutorial/src exercises solutions` finds nothing new.
- Step ids match between EN and DE.
- `./solutions/test_all.sh` passes with the pinned CLIs and the database running (`docker compose up -d`).
- Commit to `main`; push only when the maintainer asks.
