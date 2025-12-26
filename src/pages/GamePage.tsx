import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import DigitalBanker from '../../monopoly';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, players, currentPlayerId } = useGame();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify game is in playing status
    if (game && game.status !== 'playing') {
      navigate(`/lobby/${gameId}`);
      return;
    }

    // Wait for game and players to load
    if (game && players.length > 0 && currentPlayerId) {
      setIsLoading(false);
    }
  }, [game, players, currentPlayerId, gameId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen h-full bg-black text-amber-50 flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <div className="text-center">
          <p className="text-2xl mb-2">Loading game...</p>
          <p className="text-amber-600">Syncing with other players</p>
        </div>
      </div>
    );
  }

  if (!game || !currentPlayerId) {
    return (
      <div className="min-h-screen h-full bg-black text-amber-50 flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <div className="text-center">
          <p className="text-2xl mb-2">Game not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <DigitalBanker
      gameId={game.id}
      gameCode={game.code}
      initialPlayers={players}
      currentPlayerId={currentPlayerId}
      gameConfig={game.config}
    />
  );
}
