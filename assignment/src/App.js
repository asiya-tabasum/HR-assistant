// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Title from './components/Title';
import Home from './components/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
         <Route path="/Title" element={<Title />} />
        <Route path="/home" element={<Home />} />
      
      </Routes>
    </Router>
  );
}

export default App;
