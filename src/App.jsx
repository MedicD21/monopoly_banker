import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ProProvider } from './context/ProContext';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import JoinPage from './pages/JoinPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';

export default function App() {
  return (
    <BrowserRouter>
      <ProProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/lobby/:gameId" element={<LobbyPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </ProProvider>
    </BrowserRouter>
  );
}
