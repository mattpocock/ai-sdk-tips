import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tokenizer = new Tiktoken(
  // NOTE: o200k_base is the tokenizer for GPT-4o
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const input = readFileSync(
  path.join(import.meta.dirname, 'input.md'),
  'utf-8',
);

const output = tokenize(input);

console.log('Content length in characters:', input.length);
console.log(`Number of tokens:`, output.length);
console.dir(output, { depth: null, maxArrayLength: 20 });
