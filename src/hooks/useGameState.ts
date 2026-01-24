// ============================================================================
// FILE: useGameState.ts
// DESCRIPTION: Game state management hook for Anagram Snatch
// VERSION: 1.0.0
// ============================================================================

import { useCallback, useMemo, useState } from "react";
import type {
  GameState,
  Player,
  GamePhase,
  LastAction,
  GameOverData,
  LetterMessage,
} from "../types";

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export interface UseGameStateOptions {
  playerId: string | null;
}

export interface UseGameStateReturn {
  // State
  gameState: GameState | null;
  gameOverData: GameOverData | null;
  isLoading: boolean;
  error: string | null;

  // Derived state
  currentPlayer: Player | null;
  opponent: Player | null;
  players: Player[];
  isMyTurn: boolean;
  canClaimWords: boolean;
  phase: GamePhase | null;

  // State updaters
  setGameState: (state: GameState) => void;
  updateFromLetter: (letterPayload: LetterMessage["payload"]) => void;
  setGameOverData: (data: GameOverData) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetState: () => void;
}

// ----------------------------------------------------------------------------
// HOOK IMPLEMENTATION
// ----------------------------------------------------------------------------

export function useGameState(options: UseGameStateOptions): UseGameStateReturn {
  const { playerId } = options;

  const [gameState, setGameStateInternal] = useState<GameState | null>(null);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set game state with error clearing
  const setGameState = useCallback((state: GameState) => {
    setGameStateInternal(state);
    setError(null);
  }, []);

  // Update state from letter message (partial update)
  const updateFromLetter = useCallback((letterPayload: LetterMessage["payload"]) => {
    setGameStateInternal((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        openLetters: letterPayload.openLetters,
        lettersRemaining: letterPayload.lettersRemaining,
      };
    });
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setGameStateInternal(null);
    setGameOverData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Get current player
  const currentPlayer = useMemo((): Player | null => {
    if (!gameState || !playerId) return null;
    return gameState.players[playerId] || null;
  }, [gameState, playerId]);

  // Get opponent (assumes 2-player game)
  const opponent = useMemo((): Player | null => {
    if (!gameState || !playerId) return null;
    const otherPlayers = Object.values(gameState.players).filter(
      (player) => player.id !== playerId
    );
    return otherPlayers[0] || null;
  }, [gameState, playerId]);

  // Get all players as array
  const players = useMemo((): Player[] => {
    if (!gameState) return [];
    return Object.values(gameState.players);
  }, [gameState]);

  // Current phase
  const phase = useMemo((): GamePhase | null => {
    return gameState?.phase || null;
  }, [gameState]);

  // Check if it's the player's turn (in Anagram Snatch, both players can act simultaneously)
  const isMyTurn = useMemo((): boolean => {
    if (!gameState || !playerId) return false;
    // In Anagram Snatch, players can act whenever the game is in playing or final phase
    return gameState.phase === "playing" || gameState.phase === "final";
  }, [gameState, playerId]);

  // Check if player can claim words
  const canClaimWords = useMemo((): boolean => {
    if (!gameState || !playerId) return false;
    const player = gameState.players[playerId];
    if (!player) return false;

    // Can claim during playing or final phase
    const validPhase = gameState.phase === "playing" || gameState.phase === "final";
    // Player must be connected
    const isConnected = player.connected;

    return validPhase && isConnected;
  }, [gameState, playerId]);

  return {
    // State
    gameState,
    gameOverData,
    isLoading,
    error,

    // Derived state
    currentPlayer,
    opponent,
    players,
    isMyTurn,
    canClaimWords,
    phase,

    // State updaters
    setGameState,
    updateFromLetter,
    setGameOverData,
    setError,
    setLoading,
    resetState,
  };
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Calculate the score for a player based on their words
 */
export function calculatePlayerScore(player: Player): { wordCount: number; letterCount: number } {
  const wordCount = player.words.length;
  const letterCount = player.words.reduce((sum, word) => sum + word.length, 0);
  return { wordCount, letterCount };
}

/**
 * Get the winner from game state (player with most letters)
 */
export function determineWinner(players: Player[]): Player | null {
  if (players.length === 0) return null;

  let winner: Player | null = null;
  let maxLetters = -1;
  let tie = false;

  for (const player of players) {
    const { letterCount } = calculatePlayerScore(player);
    if (letterCount > maxLetters) {
      maxLetters = letterCount;
      winner = player;
      tie = false;
    } else if (letterCount === maxLetters) {
      tie = true;
    }
  }

  return tie ? null : winner;
}

/**
 * Check if a player is ready
 */
export function isPlayerReady(player: Player): boolean {
  return player.ready && player.connected;
}

/**
 * Check if all players are ready
 */
export function areAllPlayersReady(players: Player[]): boolean {
  if (players.length < 2) return false;
  return players.every((player) => isPlayerReady(player));
}

/**
 * Format the last action for display
 */
export function formatLastAction(lastAction: LastAction | null): string | null {
  if (!lastAction) return null;

  if (lastAction.actionType === "steal" && lastAction.stolenFrom) {
    return `${lastAction.playerName} stole "${lastAction.word}" from ${lastAction.stolenFrom}!`;
  }

  return `${lastAction.playerName} claimed "${lastAction.word}"!`;
}

export default useGameState;
