import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import StartScreen from '../components/StartScreen';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinGame } = useGame();

  // Handle QR code joining
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode && joinCode.length === 5) {
      joinGame(joinCode);
    }
  }, [searchParams, joinGame]);

  const handleHost = () => {
    navigate('/host');
  };

  const handleJoin = () => {
    navigate('/join');
  };

  return <StartScreen onHost={handleHost} onJoin={handleJoin} />;
}
