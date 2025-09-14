There's a lot of people out there, maybe you included, who still don't know what tokens are. Tokens are the currency of LLMs - you don't get billed in characters, you get billed in tokens.

So you need to know what a token is because you're being charged for them. Let's explain it in under two minutes.

## How LLMs Process Text

LLMs don't actually work with text, they work with numbers. Every piece of text that you send to an LLM gets turned into tokens, which are just an array of numbers.

I'm using here the tokenizer that's used for GPT-4o, or rather a JavaScript implementation of it called `js-tiktoken`:

```ts
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tokenizer = new Tiktoken(
  // NOTE: o200k_base is the tokenizer for GPT-4o
  o200k_base,
);
```

## Tokens vs Characters

I have a rather large piece of text here in `input.md`. I'm reading that file into memory and then I'm turning it into tokens using the `textToTokens` function:

```ts
const textToTokens = (text: string) => {
  return tokenizer.encode(text);
};

const input = readFileSync(
  path.join(import.meta.dirname, 'input.md'),
  'utf-8',
);

const output = textToTokens(input);

console.log('Content length in characters:', input.length);
console.log(`Number of tokens:`, output.length);
console.dir(output, { depth: null, maxArrayLength: 20 });
```

When I run this, we can see that the content length in characters, the number of letters it is, is nearly 2,300, but the number of tokens is only 484.

```
Content length in characters: 2294
Number of tokens: 484
```

That's because tokens are _chunks_ of text. They're not individual characters.

## What LLMs Actually Process

So that's what the LLM is actually reading - the tokens, not the text. You might think to yourself that LLMs are trained on text, but really they're trained on text that's been turned into tokens.

And what does an LLM output? Well, it outputs more tokens. It outputs numbers, not text, and then that tokenizer takes those tokens and turns them into text that we can read.

## Converting Tokens Back to Text

For instance, we can just pick out any random numbers here and turn them into text:

```ts
const tokensToText = (tokens: number[]) => {
  return tokenizer.decode(tokens);
};

const tokens = [13984];
const decoded = tokensToText(tokens);
console.log(decoded);
```

I found the magic token `13984` turns into `VC`. Funny.

## Why Tokens Matter

Tokens are really how LLMs think. They think in numbers, not text, and they are the currency of LLMs.

The more text you give them, that's going to be turned into more tokens, which you will then be billed for.

| Text Processing | What's Actually Happening                     |
| --------------- | --------------------------------------------- |
| You send text   | Text is converted to tokens (numbers)         |
| LLM processes   | LLM works with tokens, not text               |
| LLM responds    | LLM outputs tokens that are converted to text |
| You get billed  | Based on number of tokens, not characters     |
