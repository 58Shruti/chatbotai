
import React from 'react';
// import './App.css';
import Chatpage from './Chatpage';
// import { ChatProvider } from './context/ChatContext.jsx'; // Commented out Gemini context
import { PerplexityProvider } from './context/PerplexityContext.jsx'; // Using Perplexity context
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import CardPage from './components/CardPage.js';

function App() {
  return (
    <Router>
      <PerplexityProvider>
        <Routes>
          <Route path="/" element={<Chatpage />} />
          <Route path="/product-detail/:id" element={<CardPage />} />
        </Routes>
          <ToastContainer />
      </PerplexityProvider>
    </Router>
  );
}

export default App;
