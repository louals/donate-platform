export const BAD_WORDS = [
  // Global/Generic bad words (simplified for example)
  "scam",
  "fraud",
  "money",
  "payment",
  "bank",
  "account",
  "transfer",
  "cc",
  "credit card",
  "sex",
  "nudity",
  "porn",
  "weapon",
  "drug",
  "violence",
  // Algerian context specific or common scam phrases
  "baridimob",
  "ccp",
  "virement",
  "payement",
  "argent",
  "dollar",
  "euro",
  "dinar",
  "investir",
  "gagner",
  "gratuitement",
  "offre",
  "emploi",
];

/**
 * Checks if a text contains any words from the blacklist.
 * Returns true if text is safe, false if it contains forbidden words.
 */
export function validateText(text: string): {
  isSafe: boolean;
  foundWords: string[];
} {
  const textLower = text.toLowerCase();
  const foundWords = BAD_WORDS.filter(
    (word) =>
      new RegExp(`\\b${word}\\b`, "i").test(textLower) ||
      textLower.includes(word)
  );

  return {
    isSafe: foundWords.length === 0,
    foundWords,
  };
}
