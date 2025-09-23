import { google } from '@ai-sdk/google';
import {
  Experimental_Agent,
  stepCountIs,
  tool,
  type ModelMessage,
} from 'ai';
import z from 'zod';

const fsAgent =
  new Experimental_Agent({
    model: google(
      'gemini-2.0-flash-lite',
    ),
    onStepFinish: (step) => {
      process.stdout.write('\n\n');
    },
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
    stopWhen: [stepCountIs(5)],
  });

const result =
  await fsAgent.stream({
    messages: [
      {
        role: 'user',
        content:
          'Write a file to todo.md with the content "Do the dishes"',
      },
    ],
  });

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
