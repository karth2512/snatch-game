// ============================================================================
// FILE: PlayerPanel.tsx
// DESCRIPTION: Single player's words panel component
// ============================================================================

import { memo } from "react";
import type { Player } from "../types";
import WordChip from "./WordChip";

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onWordClick?: (word: string) => void;
}

/**
 * PlayerPanel - Displays a player's info and claimed words
 * Shows visual distinction for current player vs opponent
 */
const PlayerPanel = memo(function PlayerPanel({
  player,
  isCurrentPlayer,
  onWordClick
}: PlayerPanelProps) {
  // Calculate total letter count from all words
  const letterCount = player.words.reduce((total, word) => total + word.length, 0);
  const wordCount = player.words.length;

  const panelClasses = isCurrentPlayer
    ? "bg-game-player1 border-blue-300"
    : "bg-game-player2 border-pink-300";

  const headerClasses = isCurrentPlayer
    ? "text-blue-800"
    : "text-pink-800";

  return (
    <div
      className={`
        rounded-xl border-2 p-4
        ${panelClasses}
        transition-all duration-200
      `}
    >
      {/* Player Header */}
      <div className={`mb-3 ${headerClasses}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {player.name}
            {isCurrentPlayer && (
              <span className="ml-2 text-xs font-normal opacity-75">(You)</span>
            )}
          </h3>
          {!player.connected && (
            <span className="text-xs text-red-600 font-medium">Disconnected</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm mt-1 opacity-80">
          <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
          <span>{letterCount} letter{letterCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Words List */}
      <div className="flex flex-wrap gap-2">
        {player.words.length === 0 ? (
          <p className={`text-sm italic opacity-60 ${headerClasses}`}>
            No words yet
          </p>
        ) : (
          player.words.map((word) => (
            <WordChip
              key={word}
              word={word}
              isOwn={isCurrentPlayer}
              onClick={onWordClick ? () => onWordClick(word) : undefined}
              canSteal={!isCurrentPlayer && !!onWordClick}
            />
          ))
        )}
      </div>
    </div>
  );
});

export default PlayerPanel;
