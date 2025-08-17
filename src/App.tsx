import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './components/Landing/Landing';
import { VideoRoom } from './components/VideoRoom/VideoRoom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/live/*" element={<VideoRoom mode="live" />} />
          <Route path="/rec/*" element={<VideoRoom mode="recorded" />} />
          <Route path="/recorded/*" element={<VideoRoom mode="recorded" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;