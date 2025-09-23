import { readFileSync } from 'node:fs';
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import path from 'node:path';

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
