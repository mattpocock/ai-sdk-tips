import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';
import { GUARDRAIL_SYSTEM } from './guardrail-prompt.ts';

const checkIsRequestSafe = async (
  modelMessages: ModelMessage[],
) => {
  const guardrailResult = await generateText({
    model: google('gemini-2.0-flash-lite'),
    system: GUARDRAIL_SYSTEM,
    messages: modelMessages,
  });

  // The text will either be '0' or '1'
  const text = guardrailResult.text.trim();

  // If text is exactly '1', the request is safe.

  if (text === '1') {
    return true;
  }

  return false;
};

const streamTextToWriter = (
  writer: UIMessageStreamWriter,
  message: string,
) => {
  const id = crypto.randomUUID();
  writer.write({
    type: 'text-start',
    id,
  });

  writer.write({
    type: 'text-delta',
    id,
    delta: message,
  });

  writer.write({
    type: 'text-end',
    id,
  });
};

const continueStreaming = (
  writer: UIMessageStreamWriter,
  modelMessages: ModelMessage[],
) => {
  const streamTextResult = streamText({
    model: google('gemini-2.0-flash'),
    messages: modelMessages,
  });

  writer.merge(streamTextResult.toUIMessageStream());
};

export const POST = async (
  req: Request,
): Promise<Response> => {
  const modelMessages = convertToModelMessages(
    (await req.json()).messages,
  );

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // 1. Check if the request is safe, using a
      // super-fast LLM request that only returns a
      // single token:
      // - '0' (forbidden)
      // - '1' (allowed)
      const isSafe =
        await checkIsRequestSafe(modelMessages);

      // 2. If the request is not safe, stream the
      // blocked message to the frontend
      if (!isSafe) {
        streamTextToWriter(
          writer,
          'Guardrail blocked the request',
        );

        return;
      }

      // 3. If the request is safe, continue with
      // our normal logic.
      continueStreaming(writer, modelMessages);
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
