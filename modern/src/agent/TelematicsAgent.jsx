import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { v4 as uuidv4 } from "uuid";
export { TELEMATICS_BASE_URL } from "../env";
import TelematicsAgentResponse from "./TelematicsAgentResponse";
import "./styles/AgentResponse.css";
import { TELEMATICS_BASE_URL } from "../env";

export default function TelematicsAgent() {
  const [message, setMessage] = useState("");
  const [vehicleData, setVehicleData] = useState([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef(null);
  const [threadId, setThreadId] = useState(uuidv4());
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);


  const processStreamingData = (data) => {
    try {
      // console.log("Received data:", data);
      if (data.type === "token" && data.content) {
        setStreamingResponse((prev) => prev + data.content);
      } else if (data.type === "artifact") {
        // console.log("Artifact data:", data);
        if (data["text/csv"]) {
          const rows = data["text/csv"].split("\n");
          const headers = rows[0].split(",");
          const parsedData = rows
            .slice(1)
            .filter((row) => row.trim())
            .map((row) => {
              const values = row.split(",");
              const obj = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim() || null;
              });
              return obj;
            })
            .filter((row) => {
              // Ensure we have valid numeric data
              const hasValidSpeed = !isNaN(parseFloat(row.speed));
              const hasValidCoords =
                !isNaN(parseFloat(row.latitude)) &&
                !isNaN(parseFloat(row.longitude));
              return hasValidSpeed && hasValidCoords;
            });

          // console.log("Parsed data:", parsedData);
          if (parsedData.length > 0) {
            setVehicleData(parsedData);
          }
        } else if (data["application/json"]) {
          // Handle JSON data if provided
          try {
            const jsonData =
              typeof data["application/json"] === "string"
                ? JSON.parse(data["application/json"])
                : data["application/json"];
            console.log("JSON data:", jsonData);

            if (Array.isArray(jsonData)) {
              const processedData = jsonData
                .map((item) => ({
                  speed: item.speed?.toString() || "0",
                  latitude: item.latitude?.toString() || "0",
                  longitude: item.longitude?.toString() || "0",
                  altitude: item.altitude?.toString() || "0",
                  servertime: item.servertime || new Date().toISOString(),
                  // Add any other fields you need
                }))
                .filter((item) => !isNaN(parseFloat(item.speed)));

              if (processedData.length > 0) {
                setVehicleData(processedData);
              }
            }
          } catch (e) {
            console.error("Error parsing JSON data:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error processing data:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    setIsTyping(true);
    setVehicleData([]);
    setStreamingResponse("");

    try {
      const response = await fetch(`${TELEMATICS_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message,
          thread_id: threadId,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        console.log("chunks messages are=>", chunk);
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.type === "token") {
                  assistantMessage.content += data.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                      newMessages[newMessages.length - 1] = assistantMessage;
                    } else {
                      newMessages.push(assistantMessage);
                    }
                    return newMessages;
                  });
                }
                processStreamingData(data);
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
      setMessage("");
    } catch (error) {
      const assistantMessage = {
        role: "assistant",
        content: "Failed to send message. Please try again.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };

      setMessages(prev => [...prev, assistantMessage])
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        height: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className=""
        ref={responseRef}
        style={{
          width: "80%",
          padding: "0px 100px",
          flex: 1,
          overflowY: "auto",
          height: "200px",
        }}
      >


        {/* Chat Messages */}
        <div style={{ marginBottom: "24px" }}>
          <TelematicsAgentResponse
            messages={messages}
            isTyping={isTyping}
            vehicleData={vehicleData}
          />
        </div>

        {/* Input Section */}
        <div className="inputContainer">
          <form
            onSubmit={handleSendMessage}
            className="inputContainer-inner"
            style={{
              position: "relative",
              maxWidth: "765px",
              marginBottom: "35px",
            }}
          >
            <input
              type="text"
              placeholder="Ask me about your data..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "9px",
                paddingRight: "50px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #E0E0E0",
                backgroundColor: "#F8F9FA",
                outline: "none",
                color: "#333",
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                color: "#666",
              }}
            >
              <span style={{ fontSize: "24px" }}>➤</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
