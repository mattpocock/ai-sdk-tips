import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const anthropicResult =
  await generateText({
    model: anthropic(
      'claude-3-5-haiku-latest',
    ),
    prompt: 'Hello, world!',
  });

console.log(
  'anthropic',
  anthropicResult.usage,
);
console.log(anthropicResult.text);

const googleResult =
  await generateText({
    model: google(
      'gemini-2.0-flash-lite',
    ),
    prompt: 'Hello, world!',
  });

console.log(
  'google',
  googleResult.usage,
);
console.log(googleResult.text);
