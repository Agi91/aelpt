import { IAiProvider } from './provider.interface';
import { MockAiProvider } from './mock-provider';

export class AiProviderFactory {
  private static mockProvider = new MockAiProvider();

  /**
   * Retrieves the requested AI model provider interface implementation.
   * Standardized to easily plug in Gemini API wrapper instances.
   */
  static getProvider(type: 'gemini' | 'mock' = 'mock'): IAiProvider {
    switch (type) {
      case 'gemini':
        // Future integration: return new GeminiAiProvider()
        // Standardized to fallback on Mock provider for compiling sandbox
        return this.mockProvider;
      case 'mock':
      default:
        return this.mockProvider;
    }
  }
}
