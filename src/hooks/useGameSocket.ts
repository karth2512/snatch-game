// ============================================================================
// FILE: useGameSocket.ts
// DESCRIPTION: Main WebSocket hook for Anagram Snatch game using partysocket
// VERSION: 1.0.0
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "../utils/constants";
import type {
  ClientMessage,
  ServerMessage,
  JoinedMessage,
  StateMessage,
  LetterMessage,
  ClaimResultMessage,
  ErrorMessage,
  GameOverMessage,
  GameState,
} from "../types";

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export interface UseGameSocketOptions {
  roomCode: string;
  onJoined?: (payload: JoinedMessage["payload"]) => void;
  onStateUpdate?: (gameState: GameState) => void;
  onLetter?: (payload: LetterMessage["payload"]) => void;
  onClaimResult?: (payload: ClaimResultMessage["payload"]) => void;
  onError?: (payload: ErrorMessage["payload"]) => void;
  onGameOver?: (payload: GameOverMessage["payload"]) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseGameSocketReturn {
  connected: boolean;
  playerId: string | null;
  roomCode: string;
  send: (message: ClientMessage) => void;
  join: (playerName: string) => void;
  ready: () => void;
  claim: (word: string) => void;
  steal: (word: string, targetWord: string, targetPlayerId: string) => void;
  playAgain: () => void;
  leave: () => void;
}

// ----------------------------------------------------------------------------
// HOOK IMPLEMENTATION
// ----------------------------------------------------------------------------

export function useGameSocket(options: UseGameSocketOptions): UseGameSocketReturn {
  const {
    roomCode,
    onJoined,
    onStateUpdate,
    onLetter,
    onClaimResult,
    onError,
    onGameOver,
    onConnectionChange,
  } = options;

  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Use refs for callbacks to avoid recreating socket on callback changes
  const callbacksRef = useRef({
    onJoined,
    onStateUpdate,
    onLetter,
    onClaimResult,
    onError,
    onGameOver,
    onConnectionChange,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onJoined,
      onStateUpdate,
      onLetter,
      onClaimResult,
      onError,
      onGameOver,
      onConnectionChange,
    };
  }, [onJoined, onStateUpdate, onLetter, onClaimResult, onError, onGameOver, onConnectionChange]);

  // Initialize PartySocket connection
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomCode,

    onOpen: () => {
      console.log(`[WebSocket] Connected to room: ${roomCode}`);
      setConnected(true);
      callbacksRef.current.onConnectionChange?.(true);
    },

    onClose: (event) => {
      console.log(`[WebSocket] Disconnected from room: ${roomCode}`, event.reason);
      setConnected(false);
      callbacksRef.current.onConnectionChange?.(false);
    },

    onError: (error) => {
      console.error(`[WebSocket] Error:`, error);
    },

    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        handleServerMessage(message);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    },
  });

  // Handle incoming server messages
  const handleServerMessage = useCallback((message: ServerMessage) => {
    console.log(`[WebSocket] Received:`, message.type, message.payload);

    switch (message.type) {
      case "joined": {
        const payload = message.payload as JoinedMessage["payload"];
        setPlayerId(payload.playerId);
        callbacksRef.current.onJoined?.(payload);
        break;
      }

      case "state": {
        const payload = message.payload as StateMessage["payload"];
        callbacksRef.current.onStateUpdate?.(payload);
        break;
      }

      case "letter": {
        const payload = message.payload as LetterMessage["payload"];
        callbacksRef.current.onLetter?.(payload);
        break;
      }

      case "claimResult": {
        const payload = message.payload as ClaimResultMessage["payload"];
        callbacksRef.current.onClaimResult?.(payload);
        break;
      }

      case "error": {
        const payload = message.payload as ErrorMessage["payload"];
        console.error(`[WebSocket] Server error:`, payload.code, payload.message);
        callbacksRef.current.onError?.(payload);
        break;
      }

      case "gameOver": {
        const payload = message.payload as GameOverMessage["payload"];
        callbacksRef.current.onGameOver?.(payload);
        break;
      }

      default: {
        console.warn(`[WebSocket] Unknown message type:`, (message as ServerMessage).type);
      }
    }
  }, []);

  // Send a message to the server
  const send = useCallback(
    (message: ClientMessage) => {
      if (!connected) {
        console.warn("[WebSocket] Cannot send message: not connected");
        return;
      }
      console.log(`[WebSocket] Sending:`, message.type, message.payload);
      socket.send(JSON.stringify(message));
    },
    [connected, socket]
  );

  // Convenience methods for sending specific message types
  const join = useCallback(
    (playerName: string) => {
      send({
        type: "join",
        payload: { playerName },
      });
    },
    [send]
  );

  const ready = useCallback(() => {
    send({
      type: "ready",
      payload: {},
    });
  }, [send]);

  const claim = useCallback(
    (word: string) => {
      send({
        type: "claim",
        payload: { word },
      });
    },
    [send]
  );

  const steal = useCallback(
    (word: string, targetWord: string, targetPlayerId: string) => {
      send({
        type: "steal",
        payload: { word, targetWord, targetPlayerId },
      });
    },
    [send]
  );

  const playAgain = useCallback(() => {
    send({
      type: "playAgain",
      payload: {},
    });
  }, [send]);

  const leave = useCallback(() => {
    send({
      type: "leave",
      payload: {},
    });
  }, [send]);

  return {
    connected,
    playerId,
    roomCode,
    send,
    join,
    ready,
    claim,
    steal,
    playAgain,
    leave,
  };
}

export default useGameSocket;
