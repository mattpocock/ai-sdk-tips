class CharacterLevelTokenizer {
  mapping: Record<string, number> = {};
  reverseMapping: Record<number, string> = {};

  constructor(private readonly dataset: string) {
    const uniqueChars = [...new Set(this.dataset.split(''))];
    for (let i = 0; i < uniqueChars.length; i++) {
      this.mapping[uniqueChars[i]!] = i;
      this.reverseMapping[i] = uniqueChars[i]!;
    }
  }

  encode(text: string): number[] {
    return text.split('').map((char) => this.mapping[char]!);
  }

  decode(tokens: number[]): string {
    return tokens
      .map((token) => this.reverseMapping[token]!)
      .join('');
  }
}

const dataset = 'the cat sat on the mat';

const tokenizer = new CharacterLevelTokenizer(dataset);

const input = 'cat sat mat';

const tokens = tokenizer.encode(input);
console.log('Input:', input);
console.log('Input length:', input.length);
console.log('Encoded tokens:', tokens);

console.log('Number of tokens:', tokens.length);
