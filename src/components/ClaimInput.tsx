// ============================================================================
// FILE: ClaimInput.tsx
// DESCRIPTION: Word input and claim/steal controls for the game
// ============================================================================

import { useState, useCallback, useRef, useEffect, memo, FormEvent, KeyboardEvent } from "react";
import { MIN_WORD_LENGTH } from "../utils/constants";

interface ClaimInputProps {
  onClaim: (word: string) => void;
  onStealClick: () => void;
  disabled?: boolean;
  error?: string | null;
  success?: string | null;
  hasStealableWords: boolean;
}

/**
 * ClaimInput - Input field for claiming words from open letters
 * Includes claim button, steal button, and feedback messages
 */
const ClaimInput = memo(function ClaimInput({
  onClaim,
  onStealClick,
  disabled = false,
  error,
  success,
  hasStealableWords,
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
      onClaim(trimmedWord);
    },
    [word, disabled, isSubmitting, onClaim]
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
              outline-none
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

        {/* Steal Button Row */}
        {hasStealableWords && (
          <button
            type="button"
            onClick={onStealClick}
            disabled={disabled}
            className={`
              w-full px-4 py-2 font-medium rounded-lg transition-all
              ${disabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300"
              }
            `}
          >
            Steal a Word
          </button>
        )}

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
          Type a word using the open letters (minimum {MIN_WORD_LENGTH} letters)
        </p>
      </form>
    </div>
  );
});

export default ClaimInput;
