import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import JoinScreen from '../components/JoinScreen';

export default function JoinPage() {
  const navigate = useNavigate();
  const { joinGame } = useGame();

  const handleBack = () => {
    navigate('/');
  };

  const handleJoin = async (code: string) => {
    await joinGame(code);
    // Navigation to lobby happens in GameContext
  };

  return <JoinScreen onBack={handleBack} onJoin={handleJoin} />;
}
