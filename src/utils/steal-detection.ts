// ============================================================================
// FILE: steal-detection.ts
// DESCRIPTION: Utility functions for detecting if a word can be stolen
// ============================================================================

import type { Player } from "../types";

export interface StealTarget {
  targetWord: string;
  targetPlayerId: string;
  targetPlayerName: string;
}

/**
 * Converts a word to a sorted array of letters for comparison
 */
function getLetterCounts(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of word.toUpperCase()) {
    counts.set(letter, (counts.get(letter) || 0) + 1);
  }
  return counts;
}

/**
 * Gets the singular form of a word (removes trailing 'S')
 */
function getSingularForm(word: string): string {
  const upper = word.toUpperCase();
  if (upper.endsWith("S") && upper.length > 1) {
    return upper.slice(0, -1);
  }
  return upper;
}

/**
 * Gets the plural form of a word (adds trailing 'S')
 */
function getPluralForm(word: string): string {
  return word.toUpperCase() + "S";
}

/**
 * Checks if a word (or its singular/plural form) has already been used
 *
 * @param word - The word to check
 * @param usedWords - List of words already used in the session
 * @returns true if the word or its singular/plural variant has been used
 */
export function isDuplicateWord(word: string, usedWords: string[]): boolean {
  const upperWord = word.toUpperCase();
  const singular = getSingularForm(upperWord);
  const plural = getPluralForm(singular);

  const usedWordsUpper = usedWords.map((w) => w.toUpperCase());

  return (
    usedWordsUpper.includes(upperWord) ||
    usedWordsUpper.includes(singular) ||
    usedWordsUpper.includes(plural)
  );
}

/**
 * Checks if a word can be formed by stealing from a target word using open letters.
 * Rules:
 * - Must use ALL letters from the target word
 * - If allowPureAnagram is false: must add at least 1 letter from the open pool
 * - If allowPureAnagram is true: can be same length if it's a different arrangement
 * - The new word must be a rearrangement (not just appending)
 *
 * @param newWord - The word the player wants to form
 * @param targetWord - The word to steal from
 * @param openLetters - Available letters in the pool
 * @param allowPureAnagram - If true, allows steals with 0 additional letters (default: true)
 * @returns true if the steal is valid
 */
export function canStealWord(
  newWord: string,
  targetWord: string,
  openLetters: string[],
  allowPureAnagram: boolean = true
): boolean {
  const newWordUpper = newWord.toUpperCase();
  const targetWordUpper = targetWord.toUpperCase();

  // Get letter counts
  const newWordCounts = getLetterCounts(newWordUpper);
  const targetCounts = getLetterCounts(targetWordUpper);
  const openCounts = getLetterCounts(openLetters.join(""));

  // Check that new word contains ALL letters from target word
  for (const [letter, count] of targetCounts) {
    if ((newWordCounts.get(letter) || 0) < count) {
      return false;
    }
  }

  // Calculate remaining letters needed from pool
  const remainingNeeded = new Map<string, number>();
  for (const [letter, count] of newWordCounts) {
    const fromTarget = targetCounts.get(letter) || 0;
    const needed = count - fromTarget;
    if (needed > 0) {
      remainingNeeded.set(letter, needed);
    }
  }

  // Handle pure anagram case (same length, different arrangement)
  if (remainingNeeded.size === 0) {
    // No letters from pool needed - this is a pure anagram
    if (!allowPureAnagram) {
      return false;
    }
    // For pure anagrams: must be same length and different word
    if (newWordUpper.length !== targetWordUpper.length) {
      return false;
    }
    // Must be a different word (not the same word)
    if (newWordUpper === targetWordUpper) {
      return false;
    }
    return true;
  }

  // Standard steal: must be longer than target word
  if (newWordUpper.length <= targetWordUpper.length) {
    return false;
  }

  // Check that all remaining letters are available in the open pool
  for (const [letter, count] of remainingNeeded) {
    if ((openCounts.get(letter) || 0) < count) {
      return false;
    }
  }

  return true;
}

/**
 * Finds the best steal target for a given word.
 * Prioritizes stealing from opponents (returns the first valid match).
 * For pure anagrams (same length), skips if the word has already been used.
 *
 * @param newWord - The word the player wants to form
 * @param opponents - List of opponent players
 * @param openLetters - Available letters in the pool
 * @param usedWords - List of words already used in the session (for pure anagram checks)
 * @returns StealTarget if stealing is possible, null otherwise
 */
export function findStealTarget(
  newWord: string,
  opponents: Player[],
  openLetters: string[],
  usedWords: string[] = []
): StealTarget | null {
  const newWordUpper = newWord.toUpperCase();

  for (const opponent of opponents) {
    for (const targetWord of opponent.words) {
      const targetWordUpper = targetWord.toUpperCase();
      const isPureAnagram = newWordUpper.length === targetWordUpper.length;

      // For pure anagrams, skip if the new word has already been used
      if (isPureAnagram && isDuplicateWord(newWord, usedWords)) {
        continue;
      }

      if (canStealWord(newWord, targetWord, openLetters, true)) {
        return {
          targetWord,
          targetPlayerId: opponent.id,
          targetPlayerName: opponent.name,
        };
      }
    }
  }
  return null;
}

/**
 * Checks if a word can be formed purely from open letters
 *
 * @param word - The word to check
 * @param openLetters - Available letters in the pool
 * @returns true if the word can be formed from open letters
 */
export function canClaimFromPool(word: string, openLetters: string[]): boolean {
  const wordCounts = getLetterCounts(word.toUpperCase());
  const openCounts = getLetterCounts(openLetters.join(""));

  for (const [letter, count] of wordCounts) {
    if ((openCounts.get(letter) || 0) < count) {
      return false;
    }
  }

  return true;
}
