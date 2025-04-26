import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleRoomIdGenerate = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().slice(-4);
    setRoomId(randomId + timestamp);
  };

  const handleOneAndOneCall = () => {
    if (!roomId) {
      console.log("Please Generate Room Id First");
      alert("Please Generate Room Id First");
      return;
    }
    navigate(`room/${roomId}?type=one-on-one`);
  };

  const handleGroupCall = () => {
    if (!roomId) {
      console.log("Please Generate Room Id First");
      alert("Please Generate Room Id First");
      return;
    }
    navigate(`room/${roomId}?type=group-call`);
  };

  return (
    <>
      <style>{`
        .homepage-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f8ff;
          font-family: Arial, sans-serif;
        }

        .homepage-content {
          text-align: center;
        }

        .homepage-title {
          font-size: 36px;
          margin-bottom: 10px;
          color: #333;
        }

        .homepage-subtitle {
          font-size: 16px;
          margin-bottom: 20px;
          color: #555;
        }

        .room-id-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }

        .room-id-input {
          padding: 10px;
          margin-right: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: 220px;
          font-size: 16px;
          text-align: center;
        }

        .generate-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .generate-button:hover {
          background-color: #0056b3;
        }

        .call-buttons {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .call-button {
          padding: 15px 30px;
          margin: 0 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .call-button:hover {
          background-color: #0056b3;
        }

        .call-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .note {
          font-size: 14px;
          color: #888;
          margin-top: 20px;
        }
      `}</style>
      <div className="homepage-container">
        <div className="homepage-content">
          <h1 className="homepage-title">Welcome to Video Calling App</h1>
          <p className="homepage-subtitle">
            Start a video call with a randomly generated Room ID
          </p>
          <div className="room-id-container">
            <input
              type="text"
              className="room-id-input"
              placeholder="Generated Room ID"
              value={roomId}
              readOnly
            />
            <button className="generate-button" onClick={handleRoomIdGenerate}>
              Generate
            </button>
          </div>
          <div className="call-buttons">
            <button
              className="call-button"
              onClick={handleOneAndOneCall}
              disabled={!roomId}
            >
              One-on-One Call
            </button>
            <button
              className="call-button"
              onClick={handleGroupCall}
              disabled={!roomId}
            >
              Group Call
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
