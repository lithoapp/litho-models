# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make sync      # Fetch models from models.dev and regenerate data/models.json
make deploy    # sync + upload to S3 + invalidate CloudFront (requires AWS 'bit' profile)
make plan      # Preview Terraform infrastructure changes
make apply     # Apply Terraform changes + invalidate CloudFront
make init      # terraform init (first-time setup)
```

## Architecture

The repo has one job: produce `data/models.json` (committed, served at `api.lithoapp.com/v1/models.json`) from two inputs:

1. **`scripts/curated-providers.ts`** — the source of truth for which providers Litho exposes, their display config, auth methods, and filtering rules (e.g. `onlyFreeModels`). Edit this to add/change providers.

2. **`scripts/sync-models.ts`** — fetches `https://models.dev/api.json`, maps each `CuratedProvider` to its `sourceProvider` key in the models.dev response, transforms the data into `LithoProvider`/`LithoModel` shape, and writes `data/models.json`.

The `sourceProvider` field on `CuratedProvider` is the models.dev provider ID (e.g. `"opencode"`, `"zai-coding-plan"`). Provider fields like `baseUrl` are read from `sourceProvider.api` in the models.dev response — not hardcoded.

`openai` and `anthropic` use native SDKs in the client and must NOT have a `baseUrl`. All other providers use `@ai-sdk/openai-compatible` and get their `baseUrl` from models.dev's `api` field.

## Key Schema Notes

- `LithoProvider.internalProvider` — overrides which SDK the client uses (e.g. `"opencode"` for the free provider)
- `LithoProvider.baseUrl` — only present when models.dev has an `api` field; absent for openai/anthropic
- `onlyFreeModels: true` on a `CuratedProvider` filters to models where `cost.input === 0 && cost.output === 0`
- `data/models.json` is committed and deployed manually via `make deploy`
