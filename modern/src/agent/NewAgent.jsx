import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import "./styles/NewAgent.css";
import { FaRegUserCircle } from "react-icons/fa";
import RenderMarkdown from "./RenderMarkdown";
import { BsRobot } from "react-icons/bs";

const NewAgent = () => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [accumulatedText, setAccumulatedText] = useState("");
  const threadId = useRef(uuidv4());
  const [parsedData, setParsedData] = useState({});
  const currentArtifacts = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef(null);

  useEffect(() => {
    const parseCSVEvents = async () => {
      const newParsedData = { ...parsedData };

      for (const message of messages) {
        if (message.artifacts) {
          for (const artifact of message.artifacts) {
            if (artifact.type === "csv_content" && !parsedData[artifact.id]) {
              const parseResult = await new Promise((resolve) => {
                Papa.parse(artifact.content, {
                  header: true,
                  complete: (results) => resolve(results.data),
                });
              });
              newParsedData[artifact.id] = parseResult;
            }
          }
        }
      }

      setParsedData(newParsedData);
    };

    parseCSVEvents();
  }, [messages]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (
    role,
    content,
    timestamp = new Date().toLocaleTimeString()
  ) => {
    setMessages((prev) => [
      ...prev,
      { role, content, timestamp, artifacts: [] },
    ]);
  };

  const processStreamResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    currentArtifacts.current = [];

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString(),
        artifacts: [],
      },
    ]);
    setAccumulatedText("");

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value);
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() && line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            } catch (error) {
              console.warn("Failed to parse SSE JSON:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing stream:", error);
      addMessage("system", `Error processing response: ${error.message}`);
    } finally {
      if (accumulatedText) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: accumulatedText,
            artifacts: currentArtifacts.current,
          };
          return newMessages;
        });
      }
    }
  };

  const handleSSEEvent = (data) => {
    switch (data.type) {
      case "token":
        setAccumulatedText((prev) => {
          const newText = prev + (data.content || "");
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              const lastMessage = newMessages[newMessages.length - 1];
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: newText + "",
                artifacts: currentArtifacts.current,
              };
            }
            return newMessages;
          });
          return newText;
        });
        break;

      case "artifact":
        const newArtifact = {};
        if (data["plotly_fig/json"]) {
          newArtifact.type = "plotly_fig";
          newArtifact.content = data["plotly_fig/json"];
        } else if (data["text/html"]) {
          newArtifact.type = "html_content";
          newArtifact.content = data["text/html"];
        } else if (data["text/csv"]) {
          newArtifact.type = "csv_content";
          newArtifact.content = data["text/csv"];
          newArtifact.id = uuidv4();
        }

        if (Object.keys(newArtifact).length > 0) {
          currentArtifacts.current = [...currentArtifacts.current, newArtifact];
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              artifacts: currentArtifacts.current,
            };
            return newMessages;
          });
        }
        break;

      case "tool_start":
        if (
          data.tool === "create_visualization" ||
          data.tool === "execute_sql_query"
        ) {
          try {
            const inputData = JSON.parse(data.input);
            const toolArtifact = {
              type: "tool_start",
              tool: data.tool,
              sql_query: inputData.sql_query,
              plotly_code: inputData.plotly_code,
            };
            currentArtifacts.current = [
              ...currentArtifacts.current,
              toolArtifact,
            ];
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                artifacts: currentArtifacts.current,
              };
              return newMessages;
            });
          } catch (e) {
            console.warn("Failed to parse tool input:", e);
          }
        }
        break;

      default:
        console.warn("Unknown SSE event type:", data.type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      addMessage("user", prompt);

      const response = await fetch("https://api1001.elevatics.online/chat", {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          thread_id: threadId.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await processStreamResponse(response);
    } catch (error) {
      console.error("Submission error:", error);
      addMessage("system", `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const renderEvent = (event, index) => {
    switch (event.type) {
      case "plotly_fig":
        try {
          const plotData = JSON.parse(event.content);
          return (
            <Plot
              key={index}
              data={plotData.data}
              layout={plotData.layout}
              style={{ width: "100%", height: "500px" }}
            />
          );
        } catch (error) {
          console.error("Error parsing Plotly data:", error);
          return null;
        }

      case "csv_content":
        const data = parsedData[event.id];
        if (!data) return null;
        console.log("data is => ", data);

        if (data.length === 1) {
          return (
            <div key={index} className="kpi-cards">
              {Object.entries(data[0]).map(([key, value]) => (
                <div className="kpi-card" key={key}>
                  <h3>{key}</h3>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          );
        }

        if (data.length > 1) {
          const columns = Object.keys(data[0]);
          const xColumn = columns[0];
          const traces = columns.slice(1).map((column) => ({
            type: "scatter",
            mode: "lines",
            name: column,
            x: data.map((row) => row[xColumn]),
            y: data.map((row) => row[column]),
          }));

          return (
            <Plot
              className="dataVisulaization"
              key={index}
              data={traces}
              layout={{
                title: "Data Visualization",
                xaxis: { title: xColumn },
                yaxis: { title: "Values" },
                height: 500,
                width: "100%",
              }}
            />
          );
        }
        return null;

      case "html_content":
        return (
          <div
            style={{ padding: "5px" }}
            key={index}
            className="html-content"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        );

      case "tool_start":
        return (
          <div key={index}>
            {event.sql_query && (
              <pre className="sql-query">{event.sql_query}</pre>
            )}
            {event.plotly_code && (
              <pre className="plotly-code">{event.plotly_code}</pre>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const TypingIndicator = () => (
    <div className="message">
      <div className="typing-indicator">
        <div className="typing-indicator-dot"></div>
        <div className="typing-indicator-dot"></div>
        <div className="typing-indicator-dot"></div>
      </div>
    </div>
  );

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
        ref={responseRef}
        className="no-scrollbar"
        style={{
          width: "80%",
          padding: "0px 100px",
          flex: 1,
          overflowY: "auto",
          height: "200px",
        }}
      >
        <div className="agent-header">
          <h1>Vehicle Telematics Analytics Agent</h1>
          <div className="example-commands">
            <p className="example-label">💡 Example commands:</p>
            <ul style={{ listStyleType: "disc", marginLeft: "19px" }}>
              <li>"Plot last ride data of device 7 for last week"</li>
              <li>"Create a visualization of speed over time"</li>
              <li>"Show summarized metrics for vehicle position data"</li>
            </ul>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ marginBottom: "24px" }}>
          {messages.map((msg, index) => {
            if (msg.role === "user") {
              return (
                <div key={index} className={`message user-message ${msg.role}`}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <div className="message-avatar">
                      <FaRegUserCircle style={{ marginTop: "3px" }} size={20} />
                    </div>
                    <RenderMarkdown content={msg.content} />
                  </div>
                  <div className="timestamp">{msg.timestamp}</div>
                </div>
              );
            }

            if (msg.role === "assistant") {
              return (
                <div
                  key={index}
                  className={`message assistant-message ${msg.role}`}
                >
                  <div style={{ display: "flex", gap: "5px" }}>
                    <div className="message-avatar">
                      <BsRobot size={20} />
                    </div>
                    <RenderMarkdown content={msg.content} />
                  </div>
                  {msg.artifacts?.map((artifact, artifactIndex) =>
                    renderEvent(artifact, `${index}-${artifactIndex}`)
                  )}
                  <div className="timestamp">{msg.timestamp}</div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {isLoading && <TypingIndicator />}

        {/* Input Section */}
        <div className="inputContainer">
          <form
            onSubmit={handleSubmit}
            className="inputContainer-inner"
            style={{
              position: "relative",
              maxWidth: "768px",
              marginBottom: "35px",
            }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me about your data..."
              className="prompt-input "
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
              className="submit-button"
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
};

export default NewAgent;
