# AI Service Integration Framework

This directory houses the structured service layer and adapter patterns governing AI text generation and streaming models. It is designed to compile locally using simulated mock adapters and can be seamlessly upgraded to the real Google Gemini API.

## Directory Structure

- `provider.interface.ts`: Standard interface (`IAiProvider`) that all LLM adapters implement.
- `mock-provider.ts`: Simulated audio and prompt completion logic.
- `factory.ts`: Dependency injection engine returning target providers based on environment parameters.
- `service.ts`: Core AI controller enforcing schema validation, caching parameters, and standard status error mapping code.
- `cache.ts`: Simple memory cache instance utilizing Time-to-Live (TTL) expiration rules.
- `templates.ts`: Predefined system template functions formatters.

## Future Gemini API Integration Guide

To plug in the production Google Gemini model API, follow these guidelines:

1. **Install SDK**:

   ```bash
   npm install @google/generative-ai
   ```

2. **Create Gemini Provider**:
   Create a new provider file `apps/web/src/lib/ai/gemini-provider.ts` implementing `IAiProvider`:

   ```typescript
   import { GoogleGenAI } from '@google/generative-ai';
   import { IAiProvider } from './provider.interface';
   import {
     AiGenerateRequest,
     AiGenerateResponse,
     AiStreamResponseChunk,
   } from '@aelpt/shared';

   export class GeminiAiProvider implements IAiProvider {
     private ai: GoogleGenAI;

     constructor(apiKey: string) {
       this.ai = new GoogleGenAI({ apiKey });
     }

     async generateText(
       request: AiGenerateRequest
     ): Promise<AiGenerateResponse> {
       const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
       const result = await model.generateContent({
         contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
         generationConfig: request.options,
       });

       return { text: result.response.text() };
     }

     async generateStream(
       request: AiGenerateRequest,
       onChunk: (chunk: AiStreamResponseChunk) => void
     ): Promise<AiGenerateResponse> {
       const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
       const result = await model.generateContentStream({
         contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
         generationConfig: request.options,
       });

       let text = '';
       for await (const chunk of result.stream) {
         const chunkText = chunk.text();
         text += chunkText;
         onChunk({ text: chunkText, done: false });
       }
       onChunk({ text: '', done: true });

       return { text };
     }
   }
   ```

3. **Update Factory**:
   Plug in the instantiator inside `apps/web/src/lib/ai/factory.ts`:
   ```typescript
   static getProvider(type: 'gemini' | 'mock'): IAiProvider {
     if (type === 'gemini') {
       return new GeminiAiProvider(process.env.GEMINI_API_KEY || '');
     }
     return this.mockProvider;
   }
   ```
