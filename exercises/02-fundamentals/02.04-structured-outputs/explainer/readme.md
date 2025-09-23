Most people think that LLMs can really only produce text. And they don't think about the second thing they're really good at, which is producing structured outputs.

I have here an invoice that I'm going to pass to the LLM to extract out the information. I want to extract it out because it's in a PDF - I can't put a PDF in a database to query the raw information.

## Setting Up the Invoice Extraction

I'm going to take that PDF and read it into memory here, and then we're going to send it to Claude 3.7 Sonnet. I'm using the AI SDK here and TypeScript.

```ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, streamText } from 'ai';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import z from 'zod';

const invoice = readFileSync(
  path.join(import.meta.dirname, 'invoice.pdf'),
);

const result = await generateObject({
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
  model: anthropic('claude-3-7-sonnet-20250219'),
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
          mediaType: 'application/pdf',
        },
      ],
    },
  ],
});
```

## From Text to Structured Data

Now I'm using `streamText` here, which means I'm just going to get a text output. And that's fine, we end up with a nice little summary coming back for us.

Instead I'm going to replace this `streamText` call with a `generateObject` call. I'm then going to pass it a schema of all of the things I want to get back.

```ts
const result = await generateObject({
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
  model: anthropic('claude-3-7-sonnet-20250219'),
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
          mediaType: 'application/pdf',
        },
      ],
    },
  ],
});
```

## Defining the Schema with Zod

I'm using Zod here to declare the schema. In this case, it's an array of objects where we have name, quantity, and price. I want to see that I bought three watermelons, two mangoes, and one peach.

```ts
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
```

And when I run this now, I can see all of the items in an actual structured object that I can then plug directly into a database or just display in a table in the UI.

```ts
console.dir(result.object, { depth: null });
```

## A Recent Innovation

All of this stuff, of course, is relatively new. This is OpenAI announcing this August 6th last year. And it's essentially a feature of their API.

When you enable structured outputs, you're more likely to get a response that matches the schema that you send. So it's not a feature that's innate to LLMs. It's something that the model providers provide as a service on top of their models.

## Summary

Structured outputs allow you to get objects out of LLMs, not just text, and we used a PDF as the input here, but you can use any text or image.

| Traditional LLM Output | Structured Output     |
| ---------------------- | --------------------- |
| Raw text               | JSON objects          |
| Requires parsing       | Ready for database/UI |
| Inconsistent format    | Schema-validated      |
