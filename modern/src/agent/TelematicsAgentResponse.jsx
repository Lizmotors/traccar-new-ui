import React, { memo, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import "./styles/AgentResponse.css";
import SpeedChart from "./SpeedChart";
import AltitudeChart from "./AltitudeChart";
import RenderMap from "./RenderMap";
import MetricsSection from "./MetricsSection";
import RenderMarkdown from "./RenderMarkdown";

;


export default function TelematicsAgentResponse({
  messages,
  isTyping,
  vehicleData,
}) {

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
          .typing-indicator {
            display: flex;
            gap: 4px;
          }
          .typing-indicator span {
            width: 6px;
            height: 6px;
            background-color: #999;
            border-radius: 50%;
            animation: typing 1s infinite ease-in-out;
          }
          .typing-indicator span:nth-child(1) { animation-delay: 0.2s; }
          .typing-indicator span:nth-child(2) { animation-delay: 0.4s; }
          .typing-indicator span:nth-child(3) { animation-delay: 0.6s; }
          @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);




  return (
    <div >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.role === "user" ? "user-message" : "assistant-message"
            }`}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            <div className="message-avatar">
              {msg.role === "user" ? (
                <FaRegUserCircle style={{ marginTop: "3px" }} size={20} />
              ) : (
                <BsRobot size={20} />
              )}
            </div>
            <RenderMarkdown content={msg.content} />
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#999",
            }}
          >
            {msg.timestamp}
          </div>
          {/* Show visualizations after assistant's response if vehicle data exists */}
          {msg.role === "assistant" && vehicleData.length > 0 && (
            <div
              style={{ marginTop: "16px", maxHeight: "400px", width: "100%" }}
            >
              <RenderMap />
              <SpeedChart vehicleData={vehicleData} />
              <AltitudeChart vehicleData={vehicleData} />
              <MetricsSection vehicleData={vehicleData} />
            </div>

          )}
        </div>
      ))}
      {isTyping && (
        <div style={{ marginBottom: "16px", padding: "16px" }}>
          <div
            style={{
              display: "inline-block",
            }}
          >
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
