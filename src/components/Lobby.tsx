import { useState } from "react";
import { generateRoomCode, isValidRoomCode } from "../utils/room-code";

interface LobbyProps {
  onCreateGame: (roomCode: string, playerName: string) => void;
  onJoinGame: (roomCode: string, playerName: string) => void;
}

type LobbyMode = "select" | "create" | "join";

export function Lobby({ onCreateGame, onJoinGame }: LobbyProps) {
  const [mode, setMode] = useState<LobbyMode>("select");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = () => {
    setError(null);

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    const newRoomCode = generateRoomCode();
    onCreateGame(newRoomCode, playerName.trim());
  };

  const handleJoinGame = () => {
    setError(null);

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();
    if (!isValidRoomCode(normalizedCode)) {
      setError("Invalid room code. Must be 6 characters.");
      return;
    }

    onJoinGame(normalizedCode, playerName.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      handleCreateGame();
    } else if (mode === "join") {
      handleJoinGame();
    }
  };

  const handleBack = () => {
    setMode("select");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Anagram Snatch
        </h1>
        <p className="text-center text-white/70 mb-8">
          Steal words. Build longer ones. Win!
        </p>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("create")}
              className="w-full py-4 px-6 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Create Game
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 px-6 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Join Game
            </button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-white/50 focus:border-transparent"
                autoFocus
              />
            </div>

            {mode === "join" && (
              <div>
                <label
                  htmlFor="roomCode"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-white/50 focus:border-transparent uppercase tracking-widest text-center text-xl font-mono"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 border border-white/30"
              >
                Back
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                  mode === "create"
                    ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    : "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                }`}
              >
                {mode === "create" ? "Create" : "Join"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
