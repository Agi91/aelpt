export type AiRole = 'user' | 'model' | 'system';

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiRequestOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  candidateCount?: number;
}

export interface AiGenerateRequest {
  prompt: string;
  systemInstruction?: string;
  history?: AiMessage[];
  options?: AiRequestOptions;
}

export interface AiGenerateResponse {
  text: string;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

export interface AiStreamResponseChunk {
  text: string;
  done: boolean;
}

export type AiProviderType = 'gemini' | 'mock';

export interface AiServiceConfig {
  provider: AiProviderType;
  apiKey?: string;
  enableCache?: boolean;
}
