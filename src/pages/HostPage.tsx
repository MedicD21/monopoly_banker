import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import HostSetup from "../components/HostSetup";
import { GameConfig } from "../types/game";

export default function HostPage() {
  const navigate = useNavigate();
  const { hostGame } = useGame();

  const handleBack = () => {
    navigate("/");
  };

  const handleCreateGame = async (config: GameConfig) => {
    await hostGame(config);
    // Navigation to lobby happens in GameContext
  };

  return <HostSetup onBack={handleBack} onCreateGame={handleCreateGame} />;
}
