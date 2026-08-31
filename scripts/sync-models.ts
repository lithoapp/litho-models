import { writeFileSync } from "fs";
import { curatedProviders, type CuratedProvider } from "./curated-providers.js";

const MODELS_DEV_URL = "https://models.dev/api.json";

interface ModelsDevModel {
  id: string;
  name: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  release_date?: string;
  last_updated?: string;
  modalities?: { input?: string[]; output?: string[] };
  open_weights?: boolean;
  cost?: { input?: number; output?: number };
  limit?: { context?: number; output?: number };
  status?: string;
}

interface ModelsDevProvider {
  id: string;
  name: string;
  env?: string[];
  npm?: string;
  api?: string | null;
  doc?: string;
  models: Record<string, ModelsDevModel>;
}

type ModelsDevResponse = Record<string, ModelsDevProvider>;

interface LithoModel {
  id: string;
  name: string;
  contextWindow: number;
  maxOutput: number;
  capabilities: string[];
  cost?: { input: number; output: number };
  openWeights?: boolean;
  releaseDate?: string;
  authSupport?: string[];
}

// Models the ChatGPT/Codex OAuth backend serves. Everything else OpenAI
// publishes is API-key only. Source: the Codex CLI's live model list
// (~/.codex/models_cache.json), minus its internal-only entries.
const OPENAI_CODEX_MODELS = new Set([
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "gpt-5.5",
]);

function getOpenAIAuthSupport(modelId: string): string[] {
  return OPENAI_CODEX_MODELS.has(modelId) ? ["api_key", "oauth"] : ["api_key"];
}

interface LithoProvider {
  id: string;
  name: string;
  description: string;
  authMethods: { type: string; name: string; description?: string; oauth?: { clientId: string } }[];
  baseUrl?: string;
  defaultModel: string;
  models: Record<string, LithoModel>;
}

interface LithoOutput {
  version: string;
  generatedAt: string;
  providers: Record<string, LithoProvider>;
}

function deriveCapabilities(model: ModelsDevModel): string[] {
  const capabilities: string[] = [];
  if (model.tool_call) capabilities.push("tool_call");
  if (model.attachment) capabilities.push("attachment");
  if (model.reasoning) capabilities.push("reasoning");
  if (model.modalities?.input?.includes("image")) capabilities.push("vision");
  return capabilities;
}

function transformModel(model: ModelsDevModel): LithoModel {
  return {
    id: model.id,
    name: model.name,
    contextWindow: model.limit?.context ?? 128000,
    maxOutput: model.limit?.output ?? 4096,
    capabilities: deriveCapabilities(model),
    ...(model.cost && { cost: { input: model.cost.input ?? 0, output: model.cost.output ?? 0 } }),
    ...(model.open_weights !== undefined && { openWeights: model.open_weights }),
    ...(model.release_date && { releaseDate: model.release_date }),
  };
}

function transformProvider(
  curated: CuratedProvider,
  sourceProvider: ModelsDevProvider
): LithoProvider {
  const models: Record<string, LithoModel> = {};

  const providerAuthSupport = curated.authMethods
    .map((am) => am.type)
    .filter((t) => t !== "none") as string[];

  for (const [modelId, model] of Object.entries(sourceProvider.models)) {
    if (curated.excludedModels?.includes(modelId)) continue;
    if (curated.allowedModels && !curated.allowedModels.includes(modelId)) continue;
    if (!model.tool_call) continue; // Litho agents require tool calling

    const lithoModel = transformModel(model);

    if (curated.id === "openai") {
      lithoModel.authSupport = getOpenAIAuthSupport(modelId);
    } else if (providerAuthSupport.length > 0) {
      lithoModel.authSupport = providerAuthSupport;
    }

    models[modelId] = lithoModel;
  }

  return {
    id: curated.id,
    name: curated.name,
    description: curated.description,
    authMethods: curated.authMethods.map((am) => ({
      type: am.type,
      name: am.name,
      ...(am.description && { description: am.description }),
      ...(am.oauth && { oauth: am.oauth }),
    })),
    ...((curated.baseUrl ?? sourceProvider.api) && { baseUrl: curated.baseUrl ?? sourceProvider.api }),
    defaultModel: curated.defaultModel,
    models,
  };
}

async function fetchModels(): Promise<ModelsDevResponse> {
  console.log(`Fetching models from ${MODELS_DEV_URL}...`);
  const response = await fetch(MODELS_DEV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function generateOutput(providersData: ModelsDevResponse): LithoOutput {
  const output: LithoOutput = {
    version: new Date().toISOString().split("T")[0],
    generatedAt: new Date().toISOString(),
    providers: {},
  };

  for (const curated of curatedProviders) {
    const sourceProvider = providersData[curated.sourceProvider];
    if (!sourceProvider) {
      console.warn(`Warning: Source provider "${curated.sourceProvider}" not found in models.dev data`);
      continue;
    }

    output.providers[curated.id] = transformProvider(curated, sourceProvider);
    const modelCount = Object.keys(output.providers[curated.id].models).length;
    console.log(`  ${curated.name}: ${modelCount} models`);
  }

  return output;
}

async function main() {
  console.log("Syncing models from models.dev...\n");

  const providersData = await fetchModels();
  const output = generateOutput(providersData);

  const outputPath = "data/models.json";
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  const totalModels = Object.values(output.providers).reduce(
    (sum, p) => sum + Object.keys(p.models).length,
    0
  );

  console.log(`\nDone! Wrote ${totalModels} models from ${Object.keys(output.providers).length} providers to ${outputPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
