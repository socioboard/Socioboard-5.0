/** Lowercased words of a search query (empty query → no words → everything matches). */
export function searchWords(query: string): string[] {
  return query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

/** True when every word appears somewhere in `text` (any order, any case). */
export function matchesAll(text: string, words: readonly string[]): boolean {
  if (words.length === 0) return true;
  const haystack = text.toLocaleLowerCase();
  return words.every((word) => haystack.includes(word));
}
