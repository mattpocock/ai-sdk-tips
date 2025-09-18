import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';
import { z } from 'zod';

// 1. This is the type of our custom
// UIMessage. This gives us type safety
// on the data-suggestions part of the
// UIMessageStream.
export type MyMessage = UIMessage<
  never,
  {
    suggestions: string[];
  }
>;

const mainModel = google(
  'gemini-2.0-flash',
);
const suggestionsModel = google(
  'gemini-2.0-flash-lite',
);

const streamInitialResponse =
  async (
    modelMessages: ModelMessage[],
    writer: UIMessageStreamWriter<MyMessage>,
  ) => {
    // 1. Stream the initial response -
    // can be any streamText call with tool
    // calls, etc.
    const streamTextResult =
      streamText({
        model: mainModel,
        messages: modelMessages,
      });

    // 2. Merge the stream into the
    // UIMessageStream
    writer.merge(
      streamTextResult.toUIMessageStream(),
    );

    // 3. Consume the stream - this waits
    // until the stream is complete
    await streamTextResult.consumeStream();

    // 4. Return the messages from the response, to
    // be used in the followup suggestions
    return (
      await streamTextResult.response
    ).messages;
  };

const generateFollowupSuggestions =
  (
    modelMessages: ModelMessage[],
  ) =>
    // 1. Call streamObject, which allows us
    // to stream structured outputs to
    // the frontend
    streamObject({
      model: suggestionsModel,
      // 2. Pass in the full message history
      messages: [
        ...modelMessages,
        // 3. And append a request for followup
        // suggestions
        {
          role: 'user',
          content:
            'What question should I ask next? Return an array of suggested questions.',
        },
      ],
      // 4. These suggestions are made type-safe by
      // this Zod schema
      schema: z.object({
        suggestions: z.array(
          z.string(),
        ),
      }),
    });

const streamFollowupSuggestionsToFrontend =
  async (
    // 1. This receives the streamObject result from
    // generateFollowupSuggestions
    followupSuggestionsResult: ReturnType<
      typeof generateFollowupSuggestions
    >,
    writer: UIMessageStreamWriter<MyMessage>,
  ) => {
    // 2. Create a data part ID for the suggestions - this
    // ensures that only ONE data-suggestions part will
    // be visible in the frontend
    const dataPartId =
      crypto.randomUUID();

    // 3. Read the suggestions from the stream
    for await (const chunk of followupSuggestionsResult.partialObjectStream) {
      // 4. Write the suggestions to the UIMessageStream
      writer.write({
        id: dataPartId,
        type: 'data-suggestions',
        data:
          chunk.suggestions?.filter(
            // 5. Because of some AI SDK type weirdness,
            // we need to filter out undefined suggestions
            (suggestion) =>
              suggestion !==
              undefined,
          ) ?? [],
      });
    }
  };

export const POST = async (
  req: Request,
): Promise<Response> => {
  const body = await req.json();

  const modelMessages =
    convertToModelMessages(
      body.messages,
    );

  // 1. Create a UIMessageStream, which can handle multiple
  // streams being composed into it
  const stream =
    createUIMessageStream<MyMessage>(
      {
        execute: async ({
          writer,
        }) => {
          // 2. Stream the initial response (could be any streamText
          // call with tool calls, etc.)
          const messagesFromResponse =
            await streamInitialResponse(
              modelMessages,
              writer,
            );

          // 3. Generate the followup suggestions, passing in the
          // full message history
          const followupSuggestions =
            generateFollowupSuggestions(
              [
                ...modelMessages,
                ...messagesFromResponse,
              ],
            );

          // 4. Stream the followup suggestions to the frontend
          await streamFollowupSuggestionsToFrontend(
            followupSuggestions,
            writer,
          );
        },
      },
    );

  return createUIMessageStreamResponse(
    {
      stream,
    },
  );
};
