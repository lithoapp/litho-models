export interface AuthMethod {
  type: "api_key" | "oauth" | "none";
  name: string;
  description?: string;
}

export interface CuratedProvider {
  id: string;
  sourceProvider: string;
  name: string;
  description: string;
  autoConnect: boolean;
  authMethods: AuthMethod[];
  internalProvider?: string;
  onlyFreeModels?: boolean;
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
    onlyFreeModels: true,
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
      { type: "oauth", name: "OAuth", description: "OAuth for Codex integration" },
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
      { type: "oauth", name: "OAuth", description: "OAuth for Claude Code integration" },
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
    defaultModel: "glm-4.7",
  },
];
