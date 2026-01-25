// ============================================================================
// FILE: StealModal.tsx
// DESCRIPTION: Modal for selecting a word to steal and entering new word
// ============================================================================

import { useState, useCallback, useEffect, memo, FormEvent, KeyboardEvent } from "react";
import type { Player } from "../types";
import { MIN_WORD_LENGTH } from "../utils/constants";
import WordChip from "./WordChip";

interface StealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSteal: (word: string, targetWord: string, targetPlayerId: string) => void;
  opponents: Player[];
  openLetters: string[];
  error?: string | null;
}

/**
 * StealModal - Modal for selecting an opponent's word to steal
 * Player must select a target word and enter a new word that uses all
 * letters from the target (plus optionally letters from the open pool)
 */
const StealModal = memo(function StealModal({
  isOpen,
  onClose,
  onSteal,
  opponents,
  openLetters,
  error,
}: StealModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<{
    word: string;
    playerId: string;
    playerName: string;
  } | null>(null);
  const [newWord, setNewWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTarget(null);
      setNewWord("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Reset submitting on error
  useEffect(() => {
    if (error) {
      setIsSubmitting(false);
    }
  }, [error]);

  const handleSelectTarget = useCallback((word: string, playerId: string, playerName: string) => {
    setSelectedTarget({ word, playerId, playerName });
    setNewWord("");
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!selectedTarget) return;

      const trimmedWord = newWord.trim().toUpperCase();
      if (trimmedWord.length < MIN_WORD_LENGTH) return;
      if (isSubmitting) return;

      setIsSubmitting(true);
      onSteal(trimmedWord, selectedTarget.word, selectedTarget.playerId);
    },
    [selectedTarget, newWord, isSubmitting, onSteal]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Get all stealable words from opponents
  const stealableWords = opponents.flatMap((player) =>
    player.words.map((word) => ({
      word,
      playerId: player.id,
      playerName: player.name,
    }))
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="steal-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="steal-modal-title" className="text-xl font-bold text-gray-800 mb-4">
          Steal a Word
        </h2>

        {/* Step 1: Select target word */}
        {!selectedTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a word to steal. You must form a new word using all its letters
              (pure anagrams allowed, or add letters from the pool).
            </p>

            {stealableWords.length === 0 ? (
              <p className="text-center text-gray-500 italic py-4">
                No words available to steal
              </p>
            ) : (
              <div className="space-y-3">
                {opponents.map((player) => (
                  <div key={player.id}>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {player.name}'s words:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {player.words.map((word) => (
                        <WordChip
                          key={word}
                          word={word}
                          isOwn={false}
                          canSteal={true}
                          onClick={() => handleSelectTarget(word, player.id, player.name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Step 2: Enter new word */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-sm text-purple-800">
                Stealing <span className="font-bold">{selectedTarget.word}</span> from{" "}
                <span className="font-medium">{selectedTarget.playerName}</span>
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Letters: {selectedTarget.word.split("").join(" ")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available letters in pool:
              </label>
              <div className="flex flex-wrap gap-1 text-sm font-mono bg-gray-100 p-2 rounded">
                {openLetters.length > 0 ? (
                  openLetters.map((letter, idx) => (
                    <span key={idx} className="px-1">
                      {letter}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No letters available</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="new-word" className="block text-sm font-medium text-gray-700 mb-1">
                New word (must use ALL letters from "{selectedTarget.word}"):
              </label>
              <input
                id="new-word"
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                placeholder="Enter new word..."
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
                className="w-full px-4 py-2 text-lg font-bold tracking-wider uppercase
                  rounded-lg border-2 border-gray-300
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                  outline-none transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={newWord.trim().length < MIN_WORD_LENGTH || isSubmitting}
                className={`flex-1 px-4 py-2 font-bold rounded-lg transition-all
                  ${newWord.trim().length < MIN_WORD_LENGTH || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                  }
                `}
              >
                {isSubmitting ? "..." : "Steal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export default StealModal;
