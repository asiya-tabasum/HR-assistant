import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import Symbol from "./images/Symbol.png"
import "./Home.css";

function Home() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("")

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("message", message);

    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log("respones from backend", data)
    const botMessage = { sender: "zara", text: data.response };
    setChat((prev) => [...prev, botMessage]);
  };

  return (
    <div className="app-container">
      <div className="chat-title">
        <img src={Symbol} alt="Logo" className="logo" />Zara – HR Policy Assistant
      </div>

      <div className="file-upload">
        <label className="upload-label">
          <FiUploadCloud size={24} /> Upload HR Policy File
          <input type="file" onChange={handleFileChange} hidden />
        </label>
        {file && <span className="file-name">{file.name}</span>}
      </div>

      <div className="chat-window">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.sender === "zara" ? "zara" : "user"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Ask about HR policy..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Home;
