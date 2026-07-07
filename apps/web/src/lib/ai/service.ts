import {
  AiGenerateRequest,
  AiGenerateResponse,
  AiStreamResponseChunk,
  AiServiceConfig,
  AiGenerateRequestSchema,
} from '@aelpt/shared';
import { AiProviderFactory } from './factory';
import { aiCache } from './cache';

export class AiServiceError extends Error {
  constructor(
    public code:
      'UNAUTHORIZED' | 'RATE_LIMIT' | 'TIMEOUT' | 'VALIDATION' | 'UNKNOWN',
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'AiServiceError';
  }
}

export class AiService {
  private static defaultConfig: AiServiceConfig = {
    provider: 'mock',
    enableCache: true,
  };

  /**
   * Helper to translate standard API errors into service payloads.
   */
  private static handleError(error: unknown): never {
    if (error instanceof AiServiceError) {
      throw error;
    }

    const err = error as { status?: number; message?: string };
    const status = err.status || 500;
    const msg = err.message || 'An unknown model execution error occurred.';

    if (status === 401 || status === 403) {
      throw new AiServiceError(
        'UNAUTHORIZED',
        'Invalid API key or permission authorization denied.',
        status
      );
    }
    if (status === 429) {
      throw new AiServiceError(
        'RATE_LIMIT',
        'AI rate limits exceeded. Please retry shortly.',
        status
      );
    }
    if (status === 504 || status === 503) {
      throw new AiServiceError(
        'TIMEOUT',
        'AI provider server response timeout.',
        status
      );
    }

    throw new AiServiceError('UNKNOWN', msg, status);
  }

  /**
   * Validates parameters using shared Zod schema.
   */
  private static validateRequest(request: AiGenerateRequest): void {
    const result = AiGenerateRequestSchema.safeParse(request);
    if (!result.success) {
      throw new AiServiceError(
        'VALIDATION',
        `Invalid request parameter schemas: ${result.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }
  }

  /**
   * Requests text generation with strict validation, cached checks, and error boundaries.
   */
  static async generateText(
    request: AiGenerateRequest,
    config: Partial<AiServiceConfig> = {}
  ): Promise<AiGenerateResponse> {
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      this.validateRequest(request);

      // Check prompt memory cache if enabled
      if (finalConfig.enableCache) {
        const cached = aiCache.get(request.prompt);
        if (cached) {
          return { text: cached };
        }
      }

      // Fetch from Provider Factory
      const provider = AiProviderFactory.getProvider(finalConfig.provider);
      const response = await provider.generateText(request);

      // Write successful reply back to cache
      if (finalConfig.enableCache) {
        aiCache.set(request.prompt, response.text);
      }

      return response;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Requests text streams with progressive updates.
   */
  static async generateStream(
    request: AiGenerateRequest,
    onChunk: (chunk: AiStreamResponseChunk) => void,
    config: Partial<AiServiceConfig> = {}
  ): Promise<AiGenerateResponse> {
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      this.validateRequest(request);

      // Stream cache bypass (streaming requires live chunks).
      // Retrieve target Provider
      const provider = AiProviderFactory.getProvider(finalConfig.provider);

      let accumulatedText = '';
      const wrappedOnChunk = (chunk: AiStreamResponseChunk) => {
        accumulatedText += chunk.text;
        onChunk(chunk);
      };

      const response = await provider.generateStream(request, wrappedOnChunk);

      // Add fully collected output string to cache
      if (finalConfig.enableCache) {
        aiCache.set(request.prompt, accumulatedText);
      }

      return {
        ...response,
        text: accumulatedText,
      };
    } catch (err) {
      this.handleError(err);
    }
  }
}
