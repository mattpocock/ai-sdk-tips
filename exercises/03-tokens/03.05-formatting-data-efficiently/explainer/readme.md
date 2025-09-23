When passing data to an LLM, you've got to be careful about how that data is formatted, otherwise you might waste a ton of tokens. Let's look at an example:

## The Problem: Inefficient JSON Format

Here, we have a bunch of video transcription data in a JSON file. We want to send it to an LLM to summarize a conversation and answer questions about it.

```json
[
  {
    "text": "Welcome everyone to today's presentation on artificial intelligence.",
    "start": 0.5,
    "end": 4.2,
    "speaker": "Speaker_1",
    "confidence": 0.92
  }
  // ...
]
```

It's tempting to take this JSON and pass it directly to the LLM. But doing that would be a huge waste of tokens.

## Measuring Token Usage

Let's see how many tokens this JSON file uses. We'll use the same tokenizer that GPT-4o uses - `js-tiktoken`:

```javascript
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const tokenizer = new Tiktoken(
  o200k_base,
);

const jsonData = readFileSync(
  path.join(
    import.meta.dirname,
    'data.json',
  ),
  'utf-8',
);

const jsonTokens =
  tokenizer.encode(jsonData);

console.log(jsonTokens.length);
```

When we run this code, we can see that this JSON file gets turned into ~2,350 tokens. If you want to know why this specific number, check out [my video on tokens](https://www.youtube.com/watch?v=nKSk_TiR8YA).

## The Solution: Custom Format

We can cut the token count nearly in half by using a custom format. Here's how:

1. Parse the JSON data
2. Map over each item in the array
3. Format each item as a single line with values separated by pipe characters
4. Join the lines with newlines
5. Add a header line for clarity

Here's the code to do this:

```ts
const formattedData = JSON.parse(
  jsonData,
)
  .map(
    (item: {
      text: string;
      start: number;
      end: number;
      speaker: string;
      confidence: number;
    }) => {
      return `${item.speaker}|${item.confidence}|${item.text}|${item.start}|${item.end}`;
    },
  )
  .join('\n');

const headerLine =
  'speaker|confidence|text|start|end';

const formattedTokens =
  tokenizer.encode(
    headerLine +
      '\n' +
      formattedData,
  );

console.log(
  formattedTokens.length,
);
```

## Results Comparison

Let's compare the token counts:

| Format | Token Count  |
| ------ | ------------ |
| JSON   | 2,350 tokens |
| Custom | 1,200 tokens |

As you can see, we've cut the token count nearly in half, just by using a custom format.

## Why This Works

The custom format is more efficient because:

- It eliminates redundant field names (like "text", "speaker", etc.)
- It removes unnecessary JSON syntax (curly braces, quotation marks)
- It uses compact delimiters (pipe characters)

Over a much larger data set, this approach will be even more impactful.

## The Takeaways

I strongly recommend that whenever you're passing data to an LLM, use your own custom format. It's going to save you both time and money.

This technique works especially well for:

- Transcripts
- Log data
- Tabular data
- Any structured information

By being thoughtful about your data formatting, you can dramatically reduce token usage and the associated costs when working with large language models.
