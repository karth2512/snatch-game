// ============================================================================
// FILE: GameBoard.tsx
// DESCRIPTION: Main game view container component
// ============================================================================

import { useState, useMemo, useEffect, memo } from "react";
import type { GameState } from "../types";
import { TOTAL_LETTERS } from "../utils/constants";
import OpenLetters from "./OpenLetters";
import PlayerPanel from "./PlayerPanel";
import ClaimInput from "./ClaimInput";

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  onClaim: (word: string) => void;
  onSteal: (word: string, targetWord: string, targetPlayerId: string) => void;
  claimError?: string | null;
  claimSuccess?: string | null;
}

/**
 * GameBoard - Main game view container
 * Layout: player panels on sides, open letters in center, claim input at bottom
 */
const GameBoard = memo(function GameBoard({
  gameState,
  playerId,
  onClaim,
  onSteal,
  claimError,
  claimSuccess,
}: GameBoardProps) {
  const [newLetterIndex, setNewLetterIndex] = useState<number | null>(null);
  const [finalCountdown, setFinalCountdown] = useState<number | null>(null);

  // Track new letter animations
  useEffect(() => {
    if (gameState.openLetters.length > 0) {
      setNewLetterIndex(gameState.openLetters.length - 1);
      const timer = setTimeout(() => setNewLetterIndex(null), 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.openLetters.length]);

  // Handle final round countdown
  useEffect(() => {
    if (gameState.phase === "final" && gameState.finalRoundEndsAt) {
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((gameState.finalRoundEndsAt! - Date.now()) / 1000));
        setFinalCountdown(remaining);

        if (remaining <= 0) {
          setFinalCountdown(null);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setFinalCountdown(null);
    }
  }, [gameState.phase, gameState.finalRoundEndsAt]);

  // Get current player and opponent(s)
  const { currentPlayer, opponents } = useMemo(() => {
    const players = Object.values(gameState.players);
    const current = players.find((p) => p.id === playerId);
    const opps = players.filter((p) => p.id !== playerId);
    return { currentPlayer: current, opponents: opps };
  }, [gameState.players, playerId]);


  // Get phase display text
  const getPhaseDisplay = () => {
    switch (gameState.phase) {
      case "waiting":
        return "Waiting for opponent...";
      case "ready":
        return "Get ready!";
      case "playing":
        return "Game in progress";
      case "final":
        return "Final round!";
      case "ended":
        return "Game ended";
      default:
        return "";
    }
  };

  // Check if input should be disabled
  const isInputDisabled = gameState.phase !== "playing" && gameState.phase !== "final";

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Anagram Snatch</h1>

          <div className="flex items-center gap-4">
            {/* Phase Indicator */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                gameState.phase === "final"
                  ? "bg-red-100 text-red-800 animate-pulse"
                  : gameState.phase === "playing"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getPhaseDisplay()}
            </span>

            {/* Letters Remaining */}
            <span className="text-sm text-gray-600">
              Letters: {gameState.lettersRemaining} / {TOTAL_LETTERS}
            </span>

            {/* Room Code */}
            <span className="text-sm text-gray-400 font-mono">
              Room: {gameState.roomCode}
            </span>
          </div>
        </div>
      </header>

      {/* Final Round Countdown */}
      {gameState.phase === "final" && finalCountdown !== null && (
        <div className="bg-red-600 text-white text-center py-2 font-bold animate-pulse">
          Final Round: {finalCountdown} seconds remaining!
        </div>
      )}

      {/* Last Action Display */}
      {gameState.lastAction && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-2 text-sm">
          <span className="font-medium">{gameState.lastAction.playerName}</span>{" "}
          {gameState.lastAction.actionType === "claim" ? "claimed" : "stole"}{" "}
          <span className="font-bold">{gameState.lastAction.word}</span>
          {gameState.lastAction.stolenFrom && (
            <span> from {gameState.lastAction.stolenFrom}</span>
          )}
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Current Player */}
        <aside className="lg:w-64 flex-shrink-0">
          <PlayerPanel
            player={currentPlayer}
            isCurrentPlayer={true}
          />
        </aside>

        {/* Center - Open Letters */}
        <section className="flex-1 flex flex-col">
          <div className="bg-white rounded-xl shadow-md p-4 flex-1 flex flex-col">
            <h2 className="text-center text-sm font-medium text-gray-500 mb-2">
              Open Letters
            </h2>
            <div className="flex-1 flex items-center justify-center">
              <OpenLetters
                letters={gameState.openLetters}
                newLetterIndex={newLetterIndex}
              />
            </div>
          </div>
        </section>

        {/* Right Panel - Opponents */}
        <aside className="lg:w-64 flex-shrink-0 space-y-4">
          {opponents.map((opponent) => (
            <PlayerPanel
              key={opponent.id}
              player={opponent}
              isCurrentPlayer={false}
            />
          ))}
          {opponents.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 text-center text-gray-400">
              Waiting for opponent...
            </div>
          )}
        </aside>
      </main>

      {/* Bottom - Claim Input */}
      <footer className="bg-white shadow-t border-t py-4 px-4">
        <ClaimInput
          onClaim={onClaim}
          onSteal={onSteal}
          disabled={isInputDisabled}
          error={claimError}
          success={claimSuccess}
          opponents={opponents}
          openLetters={gameState.openLetters}
          usedWords={gameState.usedWords}
        />
      </footer>

    </div>
  );
});

export default GameBoard;
