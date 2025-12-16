import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import LobbyScreen from "../components/LobbyScreen";
import { getGame } from "../firebase/gameService";

export default function LobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const {
    game,
    players,
    currentPlayerId,
    isHost,
    updatePlayerSettings,
    toggleReady,
    startGame,
    leaveGame,
    addBot,
    removeBot,
    setBotAutoPlay,
    randomizePlayerOrder,
  } = useGame();
  const handleRandomizeOrder = () => {
    randomizePlayerOrder();
  };

  // Load game if not already loaded
  useEffect(() => {
    const loadGame = async () => {
      if (!game && gameId) {
        const gameData = await getGame(gameId);
        if (!gameData) {
          alert("Game not found");
          navigate("/");
        }
      }
    };
    loadGame();
  }, [game, gameId, navigate]);

  if (!game || !currentPlayerId) {
    return (
      <div className="min-h-screen bg-black text-amber-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handlePlayerUpdate = (name: string, pieceId: string, color: string) => {
    updatePlayerSettings(name, pieceId, color);
  };

  const handleToggleReady = () => {
    toggleReady();
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleLeave = () => {
    leaveGame();
  };

  return (
    <LobbyScreen
      gameCode={game.code}
      isHost={isHost}
      currentPlayerId={currentPlayerId}
      players={players}
      onPlayerUpdate={handlePlayerUpdate}
      onToggleReady={handleToggleReady}
      onStartGame={handleStartGame}
      onLeave={handleLeave}
      onAddBot={addBot}
      onRemoveBot={removeBot}
      onToggleBotAuto={setBotAutoPlay}
      onRandomizeOrder={handleRandomizeOrder}
    />
  );
}
