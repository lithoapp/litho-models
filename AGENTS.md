# litho-models

TypeScript scripts that build `data/models.json`, the curated provider/model catalogue Litho fetches at runtime. Terraform serves it from S3 + CloudFront.

## Layout
- `scripts/curated-providers.ts` — source of truth: which providers Litho exposes, their display config and auth methods
- `scripts/sync-models.ts` — fetches models.dev, maps each curated provider onto it, writes `data/models.json`
- `data/models.json` — committed build output
- `terraform/` — S3 bucket, CloudFront distribution, ACM certificate, Route53 records
- `Makefile` — primary entrypoint for every task

## Commands
`npm install` · `make sync` · `make plan` · `make apply` · `make deploy`

## Conventions
- Strict TypeScript run through `tsx`; no runtime dependencies
- Provider fields such as `baseUrl` come from the models.dev response, not hardcoded
- `openai` and `anthropic` use native SDKs client-side and must not carry a `baseUrl`
