import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const tokenizer = new Tiktoken(
  // NOTE: o200k_base is the tokenizer for GPT-4o
  o200k_base,
);

const tokensToText = (tokens: number[]) => {
  return tokenizer.decode(tokens);
};

const tokens = [1001, 14123];
const decoded = tokensToText(tokens);
console.log(decoded);
