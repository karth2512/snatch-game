// ============================================================================
// FILE: ClaimInput.tsx
// DESCRIPTION: Word input and claim/steal controls for the game
// ============================================================================

import { useState, useCallback, useRef, useEffect, memo, FormEvent, KeyboardEvent } from "react";
import { MIN_WORD_LENGTH } from "../utils/constants";
import { findStealTarget } from "../utils/steal-detection";
import type { Player } from "../types";

interface ClaimInputProps {
  onClaim: (word: string) => void;
  onSteal: (word: string, targetWord: string, targetPlayerId: string) => void;
  disabled?: boolean;
  error?: string | null;
  success?: string | null;
  opponents: Player[];
  openLetters: string[];
  usedWords: string[];
}

/**
 * ClaimInput - Input field for claiming words from open letters
 * Includes claim button, steal button, and feedback messages
 */
const ClaimInput = memo(function ClaimInput({
  onClaim,
  onSteal,
  disabled = false,
  error,
  success,
  opponents,
  openLetters,
  usedWords,
}: ClaimInputProps) {
  const [word, setWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear input and reset submitting state on success
  useEffect(() => {
    if (success) {
      setWord("");
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  }, [success]);

  // Reset submitting state on error
  useEffect(() => {
    if (error) {
      setIsSubmitting(false);
    }
  }, [error]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmedWord = word.trim().toUpperCase();

      if (trimmedWord.length < MIN_WORD_LENGTH) {
        return;
      }

      if (disabled || isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      // Check if this word can be formed by stealing from an opponent
      const stealTarget = findStealTarget(trimmedWord, opponents, openLetters, usedWords);

      if (stealTarget) {
        // Automatically steal from the opponent
        onSteal(trimmedWord, stealTarget.targetWord, stealTarget.targetPlayerId);
      } else {
        // Claim from open letters
        onClaim(trimmedWord);
      }
    },
    [word, disabled, isSubmitting, onClaim, onSteal, opponents, openLetters, usedWords]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Submit on Enter
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const isValidLength = word.trim().length >= MIN_WORD_LENGTH;

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Row */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Type a word..."
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className={`
              flex-1 px-4 py-3 text-lg font-bold tracking-wider uppercase
              rounded-lg border-2 transition-all
              bg-white text-gray-800
              ${disabled
                ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                : "border-gray-300 focus:border-game-accent focus:ring-2 focus:ring-game-accent/20"
              }
              outline-hidden
            `}
          />

          <button
            type="submit"
            disabled={disabled || !isValidLength || isSubmitting}
            className={`
              px-6 py-3 font-bold rounded-lg transition-all
              ${disabled || !isValidLength || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-game-accent hover:bg-amber-500 text-white shadow-md hover:shadow-lg"
              }
            `}
          >
            {isSubmitting ? "..." : "Claim"}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium animate-fade-in">
            {success}
          </div>
        )}

        {/* Helper Text */}
        <p className="text-center text-xs text-gray-500">
          Type a word (minimum {MIN_WORD_LENGTH} letters) - will auto-steal if possible
        </p>
      </form>
    </div>
  );
});

export default ClaimInput;
