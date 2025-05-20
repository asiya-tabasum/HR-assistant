import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import './Title.css';
import Symbol from "./images/Symbol.png";


const Title = () => {
  const [timeDate, setTimeDate] = useState("");
   const navigate = useNavigate();
  const updateTimeAndDate = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const formatted = `${hours}:${minutes}:${seconds} - ${day}/${month}`;
    setTimeDate(formatted);
  };

  useEffect(() => {
    const interval = setInterval(updateTimeAndDate, 1000);
    updateTimeAndDate();
    return () => clearInterval(interval);
  }, []);

const handleProceed = () => {
    navigate("/home"); // Navigate to the home page
  };

  return (
    <div className="ui-container">
      <div className="title-left">
        <h1>
          Meet <span className="accent">Zara</span><br />
          Your Smart <span className="highlight">HR Assistant</span>
        </h1>
        <p className="subtitle">
          Instantly answers questions from your company’s HR policy.
        </p>
        <div className="time-date">{timeDate}</div>
        <button className="title-button" onClick={handleProceed}> Proceed</button>
      </div>

      <div className="glass-card">
        <div className="card-header">
          <img src={Symbol} alt="Logo" className="logo" />
          <span>Zara - HR Assistant</span>
        </div>
        <div className="card-options">
          <div className="option">📄 Input raw text or PDF</div>
          <div className="option">❓ Ask related questions</div>
          <div className="option">✅ Get relevant answers</div>
        </div>
      </div>
    </div>
  );
};

export default Title;
