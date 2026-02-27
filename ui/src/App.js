import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-purple-500/30 selection:text-white pb-32">
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;
