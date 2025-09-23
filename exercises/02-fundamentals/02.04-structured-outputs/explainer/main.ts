import { anthropic } from '@ai-sdk/anthropic';
import {
  generateObject,
  generateText,
  streamText,
} from 'ai';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import z from 'zod';

const invoice = readFileSync(
  path.join(
    import.meta.dirname,
    'invoice.pdf',
  ),
);

const result =
  await generateObject({
    schema: z.object({
      items: z.array(
        z.object({
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
        }),
      ),
      total: z.number(),
      currency: z.string(),
    }),
    model: anthropic(
      'claude-3-7-sonnet-20250219',
    ),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Give me a summary of this invoice.',
          },
          {
            type: 'file',
            data: invoice,
            mediaType:
              'application/pdf',
          },
        ],
      },
    ],
  });

console.dir(result.object, {
  depth: null,
});
