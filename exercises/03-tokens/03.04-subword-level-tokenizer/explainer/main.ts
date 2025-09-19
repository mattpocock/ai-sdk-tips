class SubwordLevelTokenizer {
  mapping: Record<string, number> = {};
  reverseMapping: Record<number, string> = {};
  private vocabulary: Set<string> = new Set();

  constructor(
    private readonly dataset: string,
    private readonly maxVocabularySize: number = 100,
  ) {
    this.buildVocabulary();
  }

  private buildVocabulary(): void {
    // Start with individual characters
    const chars = [...new Set(this.dataset.split(''))];
    chars.forEach((char) => this.vocabulary.add(char));

    // Build subwords by finding frequent character pairs
    let currentVocabulary = new Set(this.vocabulary);

    while (currentVocabulary.size < this.maxVocabularySize) {
      const pairs = this.getMostFrequentPairs(
        this.dataset,
        currentVocabulary,
      );

      if (pairs.length === 0) break;

      // Add the most frequent pair to vocabulary
      const newSubword = pairs[0];
      currentVocabulary.add(newSubword!);
      this.vocabulary = new Set(currentVocabulary);
    }

    // Create mappings
    const vocabArray = Array.from(this.vocabulary);
    for (let i = 0; i < vocabArray.length; i++) {
      this.mapping[vocabArray[i]!] = i;
      this.reverseMapping[i] = vocabArray[i]!;
    }
  }

  private getMostFrequentPairs(
    text: string,
    vocabulary: Set<string>,
  ): string[] {
    const pairCounts: Record<string, number> = {};

    // Count character-level pairs directly from the text
    for (let i = 0; i < text.length - 1; i++) {
      const pair = text[i]! + text[i + 1]!;
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }

    // Filter out pairs that are already in vocabulary and only appear once
    const newPairs = Object.entries(pairCounts)
      .filter(
        ([pair, count]) => !vocabulary.has(pair) && count > 1,
      )
      .sort(([, a], [, b]) => b - a)
      .map(([pair]) => pair);

    return newPairs;
  }

  private tokenizeWithVocabulary(
    text: string,
    vocabulary: Set<string>,
  ): string[] {
    const tokens: string[] = [];
    let i = 0;

    while (i < text.length) {
      let found = false;
      // Try to match longest possible subword
      for (
        let length = Math.min(text.length - i, 10);
        length > 0;
        length--
      ) {
        const candidate = text.slice(i, i + length);
        if (vocabulary.has(candidate)) {
          tokens.push(candidate);
          i += length;
          found = true;
          break;
        }
      }

      if (!found) {
        // Fallback to single character
        tokens.push(text[i]!);
        i++;
      }
    }

    return tokens;
  }

  encode(text: string): number[] {
    const tokens = this.tokenizeWithVocabulary(
      text,
      this.vocabulary,
    );
    return tokens.map((token) => this.mapping[token]!);
  }

  decode(tokens: number[]): string {
    return tokens
      .map((token) => this.reverseMapping[token]!)
      .join('');
  }

  getVocabulary(): string[] {
    return Array.from(this.vocabulary);
  }
}

const dataset =
  'the cat sat on the mat the cat sat on the mat the cat sat on the mat';

const tokenizer = new SubwordLevelTokenizer(dataset, 50);

const input = 'cat sat mat';

const tokens = tokenizer.encode(input);
console.log('Input:', input);
console.log('Input length:', input.length);
console.log('Encoded tokens:', tokens);

console.log('Number of tokens:', tokens.length);
