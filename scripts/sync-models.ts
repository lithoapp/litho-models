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

// OpenAI Codex models — accessible via both API key and OAuth
const OPENAI_CODEX_MODELS = new Set([
  "gpt-5.3-codex",
  "gpt-5-codex",
  "gpt-5.1-codex-max",
  "gpt-5.2-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.1-codex",
]);

// OpenAI models accessible via both API key and OAuth — authSupport omitted (implies all)
const OPENAI_BOTH_AUTH_MODELS = new Set(["gpt-5.1", "gpt-5.2", "gpt-5"]);

function getOpenAIAuthSupport(modelId: string): string[] | undefined {
  if (OPENAI_CODEX_MODELS.has(modelId)) return ["api_key", "oauth"];
  if (OPENAI_BOTH_AUTH_MODELS.has(modelId)) return undefined;
  return ["api_key"];
}

interface LithoProvider {
  id: string;
  name: string;
  description: string;
  autoConnect: boolean;
  authMethods: { type: string; name: string; description?: string }[];
  internalProvider?: string;
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
  return capabilities;
}

function isFreeModel(model: ModelsDevModel): boolean {
  return (model.cost?.input ?? -1) === 0 && (model.cost?.output ?? -1) === 0;
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
    if (curated.onlyFreeModels && !isFreeModel(model)) continue;
    if (curated.excludedModels?.includes(modelId)) continue;
    if (curated.id === "openai" && modelId.startsWith("text-embedding")) continue;

    const lithoModel = transformModel(model);

    if (curated.id === "openai") {
      const authSupport = getOpenAIAuthSupport(modelId);
      if (authSupport !== undefined) lithoModel.authSupport = authSupport;
    } else if (providerAuthSupport.length > 0) {
      lithoModel.authSupport = providerAuthSupport;
    }

    models[modelId] = lithoModel;
  }

  return {
    id: curated.id,
    name: curated.name,
    description: curated.description,
    autoConnect: curated.autoConnect,
    authMethods: curated.authMethods.map((am) => ({
      type: am.type,
      name: am.name,
      ...(am.description && { description: am.description }),
    })),
    ...(curated.internalProvider && { internalProvider: curated.internalProvider }),
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
