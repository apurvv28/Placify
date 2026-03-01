import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import './index.css';

function App() {
  return (
    <div className="App min-h-screen bg-black">
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;
