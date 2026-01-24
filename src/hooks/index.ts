// ============================================================================
// FILE: hooks/index.ts
// DESCRIPTION: Export all hooks for the Anagram Snatch game
// VERSION: 1.0.0
// ============================================================================

export { useGameSocket, type UseGameSocketOptions, type UseGameSocketReturn } from "./useGameSocket";
export {
  useGameState,
  calculatePlayerScore,
  determineWinner,
  isPlayerReady,
  areAllPlayersReady,
  formatLastAction,
  type UseGameStateOptions,
  type UseGameStateReturn,
} from "./useGameState";
