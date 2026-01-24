// ============================================================================
// FILE: App.tsx
// DESCRIPTION: Main application component with state-based routing
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import type { GameState, AppScreen, GameOverData } from "../types";
import { useGameSocket } from "../hooks/useGameSocket";
import { Lobby } from "./Lobby";
import { WaitingRoom } from "./WaitingRoom";
import GameBoard from "./GameBoard";
import GameOver from "./GameOver";

/**
 * App - Main application component
 * Manages screen routing based on game state and player actions
 */
function App() {
  // Connection and game state
  const [screen, setScreen] = useState<AppScreen>("lobby");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Claim feedback state
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Connection error state
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Clear feedback messages after a delay
  useEffect(() => {
    if (claimError) {
      const timer = setTimeout(() => setClaimError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [claimError]);

  useEffect(() => {
    if (claimSuccess) {
      const timer = setTimeout(() => setClaimSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [claimSuccess]);

  // WebSocket callbacks
  const handleJoined = useCallback((payload: { playerId: string; roomCode: string; gameState: GameState }) => {
    setGameState(payload.gameState);
    setConnectionError(null);

    // Determine initial screen based on phase
    if (payload.gameState.phase === "waiting" || payload.gameState.phase === "ready") {
      setScreen("waiting");
    } else if (payload.gameState.phase === "playing" || payload.gameState.phase === "final") {
      setScreen("game");
    } else if (payload.gameState.phase === "ended") {
      setScreen("gameOver");
    }
  }, []);

  const handleStateUpdate = useCallback((state: GameState) => {
    setGameState(state);

    // Handle screen transitions based on phase changes
    if (state.phase === "waiting" || state.phase === "ready") {
      setScreen("waiting");
    } else if (state.phase === "playing" || state.phase === "final") {
      setScreen("game");
    } else if (state.phase === "ended") {
      // Don't transition to gameOver here - wait for gameOver message
    }
  }, []);

  const handleClaimResult = useCallback((payload: { success: boolean; word: string; reason?: string }) => {
    if (payload.success) {
      setClaimSuccess(`Claimed "${payload.word}"!`);
      setClaimError(null);
    } else {
      setClaimError(payload.reason || "Invalid word");
      setClaimSuccess(null);
    }
  }, []);

  const handleError = useCallback((payload: { code: string; message: string }) => {
    if (payload.code === "ROOM_FULL") {
      setConnectionError("This room is full. Please try a different room code.");
      setScreen("lobby");
      setRoomCode(null);
    } else if (payload.code === "RATE_LIMITED") {
      setClaimError("Too many attempts, please slow down");
    } else {
      setClaimError(payload.message);
    }
  }, []);

  const handleGameOver = useCallback((payload: GameOverData) => {
    setGameOverData(payload);
    setScreen("gameOver");
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    if (!connected && screen !== "lobby") {
      setConnectionError("Connection lost. Attempting to reconnect...");
    } else if (connected) {
      setConnectionError(null);
    }
  }, [screen]);

  // Initialize socket hook only when we have a room code
  const socket = useGameSocket({
    roomCode: roomCode || "",
    onJoined: handleJoined,
    onStateUpdate: handleStateUpdate,
    onClaimResult: handleClaimResult,
    onError: handleError,
    onGameOver: handleGameOver,
    onConnectionChange: handleConnectionChange,
  });

  // Auto-join when room code is set
  useEffect(() => {
    if (roomCode && playerName && socket.connected && !socket.playerId) {
      socket.join(playerName);
    }
  }, [roomCode, playerName, socket.connected, socket.playerId, socket]);

  // Lobby handlers
  const handleCreateGame = useCallback((newRoomCode: string, name: string) => {
    setRoomCode(newRoomCode);
    setPlayerName(name);
    setIsReady(false);
    setGameOverData(null);
    setConnectionError(null);
  }, []);

  const handleJoinGame = useCallback((code: string, name: string) => {
    setRoomCode(code);
    setPlayerName(name);
    setIsReady(false);
    setGameOverData(null);
    setConnectionError(null);
  }, []);

  // Waiting room handlers
  const handleReady = useCallback(() => {
    socket.ready();
    setIsReady(true);
  }, [socket]);

  // Game handlers
  const handleClaim = useCallback((word: string) => {
    setClaimError(null);
    setClaimSuccess(null);
    socket.claim(word);
  }, [socket]);

  const handleSteal = useCallback((word: string, targetWord: string, targetPlayerId: string) => {
    setClaimError(null);
    setClaimSuccess(null);
    socket.steal(word, targetWord, targetPlayerId);
  }, [socket]);

  // Game over handlers
  const handlePlayAgain = useCallback(() => {
    socket.playAgain();
    setIsReady(false);
    setGameOverData(null);
    setClaimError(null);
    setClaimSuccess(null);
  }, [socket]);

  const handleExit = useCallback(() => {
    socket.leave();
    setScreen("lobby");
    setRoomCode(null);
    setPlayerName("");
    setGameState(null);
    setGameOverData(null);
    setIsReady(false);
    setClaimError(null);
    setClaimSuccess(null);
    setConnectionError(null);
  }, [socket]);

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case "lobby":
        return (
          <Lobby
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
          />
        );

      case "waiting":
        if (!gameState || !socket.playerId) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
              <div className="text-white text-xl">Connecting...</div>
            </div>
          );
        }
        return (
          <WaitingRoom
            roomCode={gameState.roomCode}
            players={gameState.players}
            currentPlayerId={socket.playerId}
            onReady={handleReady}
            isReady={isReady}
          />
        );

      case "game":
        if (!gameState || !socket.playerId) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-gray-600 text-xl">Loading game...</div>
            </div>
          );
        }
        return (
          <GameBoard
            gameState={gameState}
            playerId={socket.playerId}
            onClaim={handleClaim}
            onSteal={handleSteal}
            claimError={claimError}
            claimSuccess={claimSuccess}
          />
        );

      case "gameOver":
        if (!gameOverData || !socket.playerId) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-gray-600 text-xl">Loading results...</div>
            </div>
          );
        }
        return (
          <GameOver
            gameOverData={gameOverData}
            currentPlayerId={socket.playerId}
            onPlayAgain={handlePlayAgain}
            onExit={handleExit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center">
          {connectionError}
        </div>
      )}

      {renderScreen()}
    </div>
  );
}

export default App;
