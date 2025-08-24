import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
  streamText,
  streamObject,
  type LanguageModel,
} from 'ai';
import { z } from 'zod';

declare const model: LanguageModel;

export type MyMessage = UIMessage<
  never,
  {
    suggestions: string[];
  }
>;

declare const modelMessages: ModelMessage[];
declare const writer: UIMessageStreamWriter<MyMessage>;

const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    // 1. Call streamText, passing in the modelMessages
    // we get from the client
    const streamTextResult = streamText({
      messages: modelMessages,
      model,
    });

    // 2. Send the text/tool calls to the client
    writer.merge(streamTextResult.toUIMessageStream());

    // 3. Consume the stream - this waits until the
    // stream is complete
    await streamTextResult.consumeStream();

    // 4. Call streamObject, using structured outputs
    // to return an array of suggestions
    const followupSuggestionsResult = streamObject({
      model,
      schema: z.object({
        suggestions: z.array(z.string()),
      }),
      messages: [
        // 5. We pass in the existing modelMessages...
        ...modelMessages,
        // 6. ...and the assistant's response
        ...(await streamTextResult.response).messages,
        // 7. ...and a new user message asking for
        // suggestions
        {
          role: 'user',
          content:
            'What question should I ask next? ' +
            'Return an array of suggested questions.',
        },
      ],
    });

    // 8. We send the suggestions to the client (see full example)
  },
});
