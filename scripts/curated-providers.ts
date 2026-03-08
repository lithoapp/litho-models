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
  autoConnect: boolean;
  authMethods: AuthMethod[];
  internalProvider?: string;
  baseUrl?: string;
  onlyFreeModels?: boolean;
  excludedModels?: string[];
  allowedModels?: string[];
  defaultModel: string;
}

export const curatedProviders: CuratedProvider[] = [
  {
    id: "free",
    sourceProvider: "opencode",
    name: "Free Models",
    description: "No setup required — free models ready to use",
    autoConnect: true,
    authMethods: [],
    internalProvider: "opencode",
    baseUrl: "https://opencode.ai/zen/v1",
    onlyFreeModels: true,
    allowedModels: ["big-pickle", "minimax-m2.5-free"],
    defaultModel: "minimax-m2.5-free",
  },
  {
    id: "openai",
    sourceProvider: "openai",
    name: "OpenAI",
    description: "GPT and Codex models from OpenAI",
    autoConnect: false,
    authMethods: [
      { type: "api_key", name: "API Key", description: "OpenAI API key from platform.openai.com" },
      { type: "oauth", name: "OAuth", description: "OAuth for Codex integration", oauth: { clientId: "app_EMoamEEZ73f0CkXaXp7hrann" } },
    ],
    defaultModel: "gpt-5.3-codex",
  },
  {
    id: "anthropic",
    sourceProvider: "anthropic",
    name: "Anthropic",
    description: "Claude models from Anthropic",
    autoConnect: false,
    authMethods: [
      { type: "api_key", name: "API Key", description: "Anthropic API key from console.anthropic.com" },
      { type: "oauth", name: "OAuth", description: "OAuth for Claude Code integration", oauth: { clientId: "9d1c250a-e61b-44d9-88ed-5944d1962f5e" } },
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
    autoConnect: false,
    authMethods: [
      { type: "api_key", name: "API Key", description: "Z.AI API key from docs.z.ai" },
    ],
    baseUrl: "https://api.z.ai/api/coding/paas/v4",
    defaultModel: "glm-4.7",
  },
];
