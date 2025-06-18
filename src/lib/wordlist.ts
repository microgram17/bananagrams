import wordListPath from './saol2018clean.csv';

let wordSet: Set<string>;

export const loadWordList = async (): Promise<Set<string>> => {
  try {
    const response = await fetch(wordListPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const words = text.split(/\r?\n/).map(word => word.trim().toLowerCase()).filter(Boolean);
    return (wordSet = new Set(words));
  } catch (error) {
    console.error("Could not load or parse word list:", error);
    return (wordSet = new Set()); // Return empty set on error
  }
};

export const isValidWord = (word: string): boolean => {
  if (!wordSet) {
    console.error("Word list not loaded yet.");
    return false;
  }

  return wordSet.has(word.toLowerCase());
};
