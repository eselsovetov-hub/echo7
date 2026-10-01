import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Menu } from './Menu';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StaffDbPage from './pages/StaffDbPage';
import PhotosPage from './pages/PhotosPage';
import ExifToolPage from './pages/ExifToolPage';
import MapPage from './pages/MapPage';
import RadioArchivePage from './pages/RadioArchivePage';
import NicknamesPage from './pages/NicknamesPage';
import HeartbeatPage from './pages/HeartbeatPage';
import LogsPage from './pages/LogsPage';
import TerminalPage from './pages/TerminalPage';
import CamerasPage from './pages/CamerasPage';
import DiaryPage from './pages/DiaryPage';
import ResetPage from './pages/ResetPage';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 font-mono">
        <Menu />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/staff-db" element={<StaffDbPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/exif-tool" element={<ExifToolPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/radio-archive" element={<RadioArchivePage />} />
          <Route path="/nicknames" element={<NicknamesPage />} />
          <Route path="/heartbeat" element={<HeartbeatPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/cameras" element={<CamerasPage />} />
          <Route path="/diary-vorel-087.html" element={<DiaryPage />} />
          <Route path="/reset" element={<ResetPage />} />
          <Route path="/index" element={<LoginPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
