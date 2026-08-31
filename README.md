# Litho Models API

Curated models API for Litho, served at `api.lithoapp.com/v1/models.json`.

## Overview

This repository hosts the curated models configuration for Litho. It pulls model data from [models.dev](https://models.dev) and transforms it into Litho's schema with additional metadata like recommended use cases and verification status.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET https://api.lithoapp.com/v1/models.json` | Returns curated models JSON |

## Project Structure

```
litho-models/
├── terraform/              # AWS infrastructure
│   ├── main.tf             # S3 + CloudFront + Route53
│   ├── variables.tf
│   ├── outputs.tf
│   ├── versions.tf
│   └── terraform.tfvars
├── scripts/
│   ├── curated-providers.ts # Provider/model curation config
│   └── sync-models.ts       # Fetches from models.dev
├── data/
│   └── models.json          # Generated output (committed)
├── package.json
├── tsconfig.json
└── Makefile
```

## Workflow

### 1. Update Models

Fetch latest models from models.dev and regenerate `data/models.json`:

```bash
make sync
# or
npm run sync
```

### 2. Plan Infrastructure Changes

Preview Terraform changes:

```bash
make plan
```

### 3. Apply Infrastructure

Deploy infrastructure to AWS:

```bash
make apply
```

### 4. Deploy Updated Models

Sync models.json to S3 and invalidate CloudFront cache:

```bash
make deploy
```

## Curated Providers

| Provider ID | Display Name | Auth Methods | Models |
|-------------|--------------|--------------|--------|
| `openai` | OpenAI | API Key, OAuth | 49 |
| `deepseek` | DeepSeek | API Key | 2 |
| `anthropic` | Anthropic | API Key | 15 |
| `zai-coding-plan` | Z.AI | API Key | 5 |

### Adding/Modifying Providers

Edit `scripts/curated-providers.ts` to:
- Add new providers (set `sourceProvider` to the models.dev provider ID)
- Restrict the exposed model set with `allowedModels` / `excludedModels`
- Change auth methods or descriptions

## Schema

### models.json Structure

```json
{
  "version": "2026-03-03",
  "generatedAt": "2026-03-03T12:00:00Z",
  "providers": {
    "<provider-id>": {
      "id": "string",
      "name": "string",
      "description": "string",
      "authMethods": [{ "type": "api_key|oauth|none", "name": "string" }],
      "defaultModel": "string",
      "models": {
        "<model-id>": {
          "id": "string",
          "name": "string",
          "contextWindow": number,
          "maxOutput": number,
          "capabilities": ["tool_call", "attachment", "reasoning"],
          "cost": { "input": number, "output": number },
          "openWeights": boolean,
          "releaseDate": "string"
        }
      }
    }
  }
}
```

## Requirements

- Node.js 18+
- Terraform 1.0+
- AWS CLI with `bit` profile configured

## Infrastructure

- **S3 Bucket**: `lithoapp-api` (stores models.json)
- **CloudFront**: CDN with `api.lithoapp.com` alias, CORS enabled
- **ACM Certificate**: SSL for api.lithoapp.com (us-east-1)
- **Route53**: A/AAAA records pointing to CloudFront
