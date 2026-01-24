import { useState } from "react";
import type { Player } from "../types";

interface WaitingRoomProps {
  roomCode: string;
  players: Record<string, Player>;
  currentPlayerId: string;
  onReady: () => void;
  isReady: boolean;
}

export function WaitingRoom({
  roomCode,
  players,
  currentPlayerId,
  onReady,
  isReady,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const playerList = Object.values(players);
  const currentPlayer = players[currentPlayerId];
  const opponent = playerList.find((p) => p.id !== currentPlayerId);
  const allReady = playerList.length >= 2 && playerList.every((p) => p.ready);
  const waitingForOpponent = playerList.length < 2;
  const waitingForOpponentReady =
    playerList.length >= 2 && !allReady && isReady;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Waiting Room
        </h1>

        {/* Room Code Display */}
        <div className="mb-8">
          <p className="text-center text-white/70 text-sm mb-2">
            Share this code with your opponent
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="bg-white/20 px-6 py-4 rounded-xl">
              <span className="text-4xl font-mono font-bold text-white tracking-[0.3em]">
                {roomCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/30"
              title="Copy room code"
            >
              {copied ? (
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-center text-green-400 text-sm mt-2">
              Copied to clipboard!
            </p>
          )}
        </div>

        {/* Connected Players */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white/80 mb-4">Players</h2>
          <div className="space-y-3">
            {/* Current Player */}
            {currentPlayer && (
              <div className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-white font-medium">
                    {currentPlayer.name}{" "}
                    <span className="text-white/50">(You)</span>
                  </span>
                </div>
                {currentPlayer.ready && (
                  <span className="px-3 py-1 bg-green-500/30 text-green-300 text-sm rounded-full">
                    Ready
                  </span>
                )}
              </div>
            )}

            {/* Opponent */}
            {opponent ? (
              <div className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${opponent.connected ? "bg-green-400" : "bg-yellow-400"}`}
                  ></div>
                  <span className="text-white font-medium">{opponent.name}</span>
                </div>
                {opponent.ready && (
                  <span className="px-3 py-1 bg-green-500/30 text-green-300 text-sm rounded-full">
                    Ready
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center bg-white/5 px-4 py-3 rounded-xl border border-dashed border-white/20">
                <span className="text-white/50 italic">
                  Waiting for opponent to join...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6">
          {waitingForOpponent && (
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Waiting for opponent...</span>
            </div>
          )}
          {waitingForOpponentReady && (
            <div className="flex items-center justify-center gap-2 text-blue-300">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Waiting for opponent to ready up...</span>
            </div>
          )}
          {allReady && (
            <div className="flex items-center justify-center gap-2 text-green-300">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>All players ready! Starting game...</span>
            </div>
          )}
        </div>

        {/* Ready Button */}
        <button
          onClick={onReady}
          disabled={isReady || waitingForOpponent}
          className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-200 ${
            isReady
              ? "bg-green-500/30 text-green-300 cursor-not-allowed border border-green-500/50"
              : waitingForOpponent
                ? "bg-gray-500/30 text-gray-400 cursor-not-allowed border border-gray-500/30"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-[1.02] shadow-lg"
          }`}
        >
          {isReady ? "Ready!" : "I'm Ready"}
        </button>
      </div>
    </div>
  );
}
