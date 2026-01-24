// ============================================================================
// FILE: Letter.tsx
// DESCRIPTION: Single letter tile display component
// ============================================================================

import { memo } from "react";

interface LetterProps {
  letter: string;
  isNew?: boolean;
  onClick?: () => void;
}

/**
 * Letter - Displays a single letter tile with optional animations
 * Uses the letter-tile class from index.css for base styling
 */
const Letter = memo(function Letter({ letter, isNew = false, onClick }: LetterProps) {
  return (
    <div
      className={`
        letter-tile
        ${isNew ? "animate-flip-in" : ""}
        ${onClick ? "cursor-pointer hover:scale-110 hover:shadow-lg" : ""}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {letter.toUpperCase()}
    </div>
  );
});

export default Letter;
