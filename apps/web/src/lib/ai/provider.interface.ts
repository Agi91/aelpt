import {
  AiGenerateRequest,
  AiGenerateResponse,
  AiStreamResponseChunk,
} from '@aelpt/shared';

export interface IAiProvider {
  /**
   * Generates a single block of text based on the request.
   */
  generateText(request: AiGenerateRequest): Promise<AiGenerateResponse>;

  /**
   * Streams the generation chunk by chunk, triggering onChunk callback.
   * Returns the final combined response output.
   */
  generateStream(
    request: AiGenerateRequest,
    onChunk: (chunk: AiStreamResponseChunk) => void
  ): Promise<AiGenerateResponse>;
}
