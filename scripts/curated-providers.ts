export interface OAuthConfig {
  clientId: string;
}

export interface AuthMethod {
  type: "api_key" | "oauth" | "none";
  name: string;
  description?: string;
  oauth?: OAuthConfig;
}

export interface CuratedProvider {
  id: string;
  sourceProvider: string;
  name: string;
  description: string;
  authMethods: AuthMethod[];
  baseUrl?: string;
  excludedModels?: string[];
  allowedModels?: string[];
  defaultModel: string;
}

export const curatedProviders: CuratedProvider[] = [
  {
    id: "openai",
    sourceProvider: "openai",
    name: "OpenAI",
    description: "GPT and Codex models from OpenAI",
    authMethods: [
      { type: "api_key", name: "API Key", description: "OpenAI API key from platform.openai.com" },
      // OpenAI's own published Codex CLI OAuth client ID — a public PKCE
      // client with no secret, reused the way other third-party Codex
      // integrations do. Not a Litho credential; safe to publish.
      { type: "oauth", name: "OAuth", description: "OAuth for Codex integration", oauth: { clientId: "app_EMoamEEZ73f0CkXaXp7hrann" } },
    ],
    // Retired from the Codex backend and never served by the public API.
    excludedModels: ["gpt-5.3-codex", "gpt-5.3-codex-spark", "gpt-realtime-2.1"],
    defaultModel: "gpt-5.6-sol",
  },
  {
    id: "deepseek",
    sourceProvider: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek V4 models with your DeepSeek API key",
    authMethods: [
      { type: "api_key", name: "API Key", description: "DeepSeek API key from platform.deepseek.com" },
    ],
    allowedModels: ["deepseek-v4-flash", "deepseek-v4-pro"],
    defaultModel: "deepseek-v4-flash",
  },
  {
    id: "anthropic",
    sourceProvider: "anthropic",
    name: "Anthropic",
    description: "Claude models from Anthropic",
    authMethods: [
      { type: "api_key", name: "API Key", description: "Anthropic API key from console.anthropic.com" },
    ],
    excludedModels: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-latest",
      "claude-3-sonnet-20240229",
      "claude-3-5-haiku-20241022",
      "claude-3-5-sonnet-20240620",
      "claude-3-7-sonnet-latest",
      "claude-3-7-sonnet-20250219",
      "claude-3-haiku-20240307",
      "claude-3-opus-20240229",
    ],
    defaultModel: "claude-sonnet-4-6",
  },
  {
    id: "zai-coding-plan",
    sourceProvider: "zai-coding-plan",
    name: "Z.AI",
    description: "GLM models from Z.AI Coding Plan — all free",
    authMethods: [
      { type: "api_key", name: "API Key", description: "Z.AI API key from docs.z.ai" },
    ],
    baseUrl: "https://api.z.ai/api/coding/paas/v4",
    defaultModel: "glm-4.7",
  },
];
