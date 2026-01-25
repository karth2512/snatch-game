// ============================================================================
// FILE: types.ts
// DESCRIPTION: Shared type definitions for client-server communication
// VERSION: 1.0.0
// ============================================================================

// ----------------------------------------------------------------------------
// GAME STATE TYPES
// ----------------------------------------------------------------------------

export interface Player {
  id: string;
  name: string;
  words: string[];
  connected: boolean;
  ready: boolean;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  openLetters: string[];
  lettersRemaining: number;
  players: Record<string, Player>;
  letterIntervalMs: number;
  finalRoundEndsAt: number | null;
  lastAction: LastAction | null;
  usedWords: string[];
}

export type GamePhase =
  | "waiting"
  | "ready"
  | "playing"
  | "final"
  | "ended";

export interface LastAction {
  playerId: string;
  playerName: string;
  actionType: "claim" | "steal";
  word: string;
  stolenFrom?: string;
  timestamp: number;
}

// ----------------------------------------------------------------------------
// CLIENT → SERVER MESSAGES
// ----------------------------------------------------------------------------

export type ClientMessage =
  | JoinMessage
  | ReadyMessage
  | ClaimMessage
  | StealMessage
  | PlayAgainMessage
  | LeaveMessage;

export interface JoinMessage {
  type: "join";
  payload: {
    playerName: string;
  };
}

export interface ReadyMessage {
  type: "ready";
  payload: Record<string, never>;
}

export interface ClaimMessage {
  type: "claim";
  payload: {
    word: string;
  };
}

export interface StealMessage {
  type: "steal";
  payload: {
    word: string;
    targetWord: string;
    targetPlayerId: string;
  };
}

export interface PlayAgainMessage {
  type: "playAgain";
  payload: Record<string, never>;
}

export interface LeaveMessage {
  type: "leave";
  payload: Record<string, never>;
}

// ----------------------------------------------------------------------------
// SERVER → CLIENT MESSAGES
// ----------------------------------------------------------------------------

export type ServerMessage =
  | JoinedMessage
  | StateMessage
  | LetterMessage
  | ClaimResultMessage
  | ErrorMessage
  | GameOverMessage;

export interface JoinedMessage {
  type: "joined";
  payload: {
    playerId: string;
    roomCode: string;
    gameState: GameState;
  };
}

export interface StateMessage {
  type: "state";
  payload: GameState;
}

export interface LetterMessage {
  type: "letter";
  payload: {
    letter: string;
    openLetters: string[];
    lettersRemaining: number;
  };
}

export interface ClaimResultMessage {
  type: "claimResult";
  payload: {
    success: boolean;
    word: string;
    reason?: string;
  };
}

export interface ErrorMessage {
  type: "error";
  payload: {
    code: ErrorCode;
    message: string;
  };
}

export type ErrorCode =
  | "ROOM_FULL"
  | "INVALID_NAME"
  | "RATE_LIMITED"
  | "INVALID_MESSAGE"
  | "GAME_NOT_STARTED"
  | "GAME_ALREADY_ENDED";

export interface GameOverMessage {
  type: "gameOver";
  payload: {
    winner: string | null;
    winnerName: string | null;
    finalScores: {
      playerId: string;
      playerName: string;
      wordCount: number;
      letterCount: number;
      words: string[];
    }[];
    reason: "completed" | "forfeit" | "agreement";
  };
}

// ----------------------------------------------------------------------------
// UI STATE TYPES
// ----------------------------------------------------------------------------

export type AppScreen = "lobby" | "waiting" | "game" | "gameOver";

export interface GameOverData {
  winner: string | null;
  winnerName: string | null;
  finalScores: {
    playerId: string;
    playerName: string;
    wordCount: number;
    letterCount: number;
    words: string[];
  }[];
  reason: "completed" | "forfeit" | "agreement";
}
