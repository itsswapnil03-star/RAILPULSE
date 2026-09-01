import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';
import Footer from './components/shared/Footer';
import ControlRoomView from './components/control/ControlRoomView';
import PassengerView from './components/passenger/PassengerView';
import StationBoardView from './components/stations/StationBoardView';
import FullGISMapView from './components/views/FullGISMapView';

export default function App() {
  const navigate = useNavigate();
  const [selectedStationCode, setSelectedStationCode] = useState('PUNE');

  const handleSelectStation = (code) => {
    setSelectedStationCode(code);
    navigate('/stations');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] font-sans antialiased overflow-x-hidden">
      {/* Top Fixed Navbar */}
      <Navbar selectedStationCode={selectedStationCode} onSelectStation={handleSelectStation} />

      {/* Side Fixed Nav for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 pt-16 pb-10 min-h-screen flex flex-col bg-[#f7f9fb]">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1680px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<ControlRoomView />} />
            <Route path="/control" element={<ControlRoomView />} />
            <Route path="/passenger" element={<PassengerView />} />
            <Route path="/stations" element={<StationBoardView initialStationCode={selectedStationCode} />} />
            <Route path="/map" element={<FullGISMapView />} />
            <Route path="*" element={<Navigate to="/control" replace />} />
          </Routes>
        </div>
      </main>

      {/* Bottom Fixed Footer */}
      <Footer />
    </div>
  );
}
