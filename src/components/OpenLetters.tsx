// ============================================================================
// FILE: OpenLetters.tsx
// DESCRIPTION: Grid display of available letters in the center pool
// ============================================================================

import { memo } from "react";
import Letter from "./Letter";

interface OpenLettersProps {
  letters: string[];
  newLetterIndex: number | null;
}

/**
 * OpenLetters - Displays all available letters in a responsive grid
 * Animates newly added letters with the flip-in animation
 */
const OpenLetters = memo(function OpenLetters({ letters, newLetterIndex }: OpenLettersProps) {
  if (letters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[120px] text-gray-400">
        <p className="text-lg">Waiting for letters...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center p-4">
      {letters.map((letter, index) => (
        <Letter
          key={`${index}-${letter}`}
          letter={letter}
          isNew={index === newLetterIndex}
        />
      ))}
    </div>
  );
});

export default OpenLetters;
