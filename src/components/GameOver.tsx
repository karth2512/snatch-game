// ============================================================================
// FILE: GameOver.tsx
// DESCRIPTION: Game over results screen component
// ============================================================================

import { memo, useMemo } from "react";
import type { GameOverData } from "../types";

interface GameOverProps {
  gameOverData: GameOverData;
  currentPlayerId: string;
  onPlayAgain: () => void;
  onExit: () => void;
}

/**
 * GameOver - Results screen showing winner, scores, and word lists
 */
const GameOver = memo(function GameOver({
  gameOverData,
  currentPlayerId,
  onPlayAgain,
  onExit,
}: GameOverProps) {
  const { winner, winnerName, finalScores, reason } = gameOverData;

  // Determine if current player won, lost, or tied
  const gameResult = useMemo(() => {
    if (winner === null) {
      return "tie";
    }
    if (winner === currentPlayerId) {
      return "win";
    }
    return "lose";
  }, [winner, currentPlayerId]);

  // Sort scores by word count (descending), then by letter count
  const sortedScores = useMemo(() => {
    return [...finalScores].sort((a, b) => {
      if (b.wordCount !== a.wordCount) {
        return b.wordCount - a.wordCount;
      }
      return b.letterCount - a.letterCount;
    });
  }, [finalScores]);

  // Get result message and styling
  const getResultDisplay = () => {
    switch (gameResult) {
      case "win":
        return {
          title: "You Won!",
          subtitle: "Congratulations!",
          bgClass: "bg-linear-to-br from-green-400 to-emerald-600",
          textClass: "text-white",
          iconEmoji: null,
        };
      case "lose":
        return {
          title: `${winnerName} Wins`,
          subtitle: "Better luck next time!",
          bgClass: "bg-linear-to-br from-gray-400 to-gray-600",
          textClass: "text-white",
          iconEmoji: null,
        };
      case "tie":
        return {
          title: "It's a Tie!",
          subtitle: "Well matched game!",
          bgClass: "bg-linear-to-br from-amber-400 to-yellow-600",
          textClass: "text-white",
          iconEmoji: null,
        };
    }
  };

  const resultDisplay = getResultDisplay();

  // Get reason message
  const getReasonMessage = () => {
    switch (reason) {
      case "completed":
        return "All letters revealed";
      case "forfeit":
        return "Opponent disconnected";
      case "agreement":
        return "Game ended by agreement";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Winner Announcement */}
        <div
          className={`
            ${resultDisplay.bgClass} ${resultDisplay.textClass}
            rounded-2xl p-8 text-center shadow-xl
          `}
        >
          <h1 className="text-4xl font-bold mb-2">{resultDisplay.title}</h1>
          <p className="text-lg opacity-90">{resultDisplay.subtitle}</p>
          {reason && (
            <p className="text-sm opacity-75 mt-2">{getReasonMessage()}</p>
          )}
        </div>

        {/* Scores Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 border-b px-6 py-3">
            <h2 className="font-bold text-gray-800">Final Scores</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="text-left px-6 py-3 font-medium">Player</th>
                <th className="text-center px-4 py-3 font-medium">Words</th>
                <th className="text-center px-4 py-3 font-medium">Letters</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score) => {
                const isCurrentPlayer = score.playerId === currentPlayerId;
                const isWinner = score.playerId === winner;

                return (
                  <tr
                    key={score.playerId}
                    className={`
                      border-b last:border-b-0
                      ${isCurrentPlayer ? "bg-blue-50" : ""}
                      ${isWinner && !isCurrentPlayer ? "bg-green-50" : ""}
                    `}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <span className="text-amber-500 text-lg" title="Winner">
                            *
                          </span>
                        )}
                        <span
                          className={`font-medium ${
                            isCurrentPlayer ? "text-blue-800" : "text-gray-800"
                          }`}
                        >
                          {score.playerName}
                          {isCurrentPlayer && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-4 font-bold text-lg">
                      {score.wordCount}
                    </td>
                    <td className="text-center px-4 py-4 text-gray-600">
                      {score.letterCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Word Lists */}
        <div className="grid md:grid-cols-2 gap-4">
          {sortedScores.map((score) => {
            const isCurrentPlayer = score.playerId === currentPlayerId;

            return (
              <div
                key={score.playerId}
                className={`
                  rounded-xl border-2 p-4
                  ${isCurrentPlayer
                    ? "bg-blue-50 border-blue-200"
                    : "bg-pink-50 border-pink-200"
                  }
                `}
              >
                <h3
                  className={`font-bold mb-3 ${
                    isCurrentPlayer ? "text-blue-800" : "text-pink-800"
                  }`}
                >
                  {score.playerName}'s Words ({score.words.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {score.words.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No words claimed</p>
                  ) : (
                    score.words.map((word) => (
                      <span
                        key={word}
                        className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${isCurrentPlayer
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                          }
                        `}
                      >
                        {word}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 bg-game-accent hover:bg-amber-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Play Again
          </button>
          <button
            onClick={onExit}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-all"
          >
            Exit to Lobby
          </button>
        </div>
      </div>
    </div>
  );
});

export default GameOver;
