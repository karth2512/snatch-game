// ============================================================================
// FILE: WordChip.tsx
// DESCRIPTION: Claimed word display chip component
// ============================================================================

import { memo } from "react";

interface WordChipProps {
  word: string;
  isOwn: boolean;
  onClick?: () => void;
  canSteal?: boolean;
}

/**
 * WordChip - Displays a claimed word with styling based on ownership
 * Uses player1 (blue) for own words and player2 (pink) for opponent words
 */
const WordChip = memo(function WordChip({
  word,
  isOwn,
  onClick,
  canSteal = false
}: WordChipProps) {
  const baseClasses = "word-chip";

  const colorClasses = isOwn
    ? "bg-game-player1 text-blue-800 border border-blue-300"
    : "bg-game-player2 text-pink-800 border border-pink-300";

  const interactiveClasses = canSteal
    ? "hover:ring-2 hover:ring-amber-400 hover:ring-offset-1 cursor-pointer"
    : onClick
    ? "cursor-pointer"
    : "cursor-default";

  return (
    <button
      type="button"
      className={`${baseClasses} ${colorClasses} ${interactiveClasses}`}
      onClick={onClick}
      disabled={!onClick}
      title={canSteal ? "Click to select for stealing" : undefined}
    >
      {word.toUpperCase()}
    </button>
  );
});

export default WordChip;
