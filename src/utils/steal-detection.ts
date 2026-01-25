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
 * Checks if a word can be formed by stealing from a target word using open letters.
 * Rules:
 * - Must use ALL letters from the target word
 * - Must add at least 1 letter from the open pool
 * - The new word must be a rearrangement (not just appending)
 *
 * @param newWord - The word the player wants to form
 * @param targetWord - The word to steal from
 * @param openLetters - Available letters in the pool
 * @returns true if the steal is valid
 */
export function canStealWord(
  newWord: string,
  targetWord: string,
  openLetters: string[]
): boolean {
  const newWordUpper = newWord.toUpperCase();
  const targetWordUpper = targetWord.toUpperCase();

  // New word must be longer than target word (at least 1 letter from pool)
  if (newWordUpper.length <= targetWordUpper.length) {
    return false;
  }

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

  // Must use at least 1 letter from open pool
  if (remainingNeeded.size === 0) {
    // This would mean no letters from pool are used - not valid
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
 *
 * @param newWord - The word the player wants to form
 * @param opponents - List of opponent players
 * @param openLetters - Available letters in the pool
 * @returns StealTarget if stealing is possible, null otherwise
 */
export function findStealTarget(
  newWord: string,
  opponents: Player[],
  openLetters: string[]
): StealTarget | null {
  for (const opponent of opponents) {
    for (const targetWord of opponent.words) {
      if (canStealWord(newWord, targetWord, openLetters)) {
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
