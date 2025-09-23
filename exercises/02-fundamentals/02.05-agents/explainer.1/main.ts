import { google } from '@ai-sdk/google';
import {
  streamText,
  tool,
  type ModelMessage,
} from 'ai';
import z from 'zod';

let step = 0;
const messageHistory: ModelMessage[] =
  [
    {
      role: 'user',
      content:
        'Write a file to todo.md with the content "Do the dishes"',
    },
  ];

while (step < 5) {
  const result = streamText({
    model: google(
      'gemini-2.0-flash-lite',
    ),
    messages: messageHistory,
    tools: {
      writeFile: tool({
        description:
          'Write a file to the filesystem',
        inputSchema: z.object({
          path: z.string(),
          content: z.string(),
        }),
        execute: async ({
          path,
          content,
        }) => {
          const message = `File written successfully to ${path}!`;
          process.stdout.write(
            'Tool call successful: ' +
              message,
          );
          return message;
        },
      }),
    },
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  const messagesProduced = (
    await result.response
  ).messages;

  messageHistory.push(
    ...messagesProduced,
  );

  const finishReason =
    await result.finishReason;

  if (finishReason === 'stop') {
    break;
  }

  step++;
  process.stdout.write('\n\n');
}
