import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import "./styles/NewAgent.css";
import "./styles/KPICards.css";
import "./styles/AgentResponse.css";
import { FaRegUserCircle } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { Mic } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Tilt from "react-parallax-tilt";
// import NewAgentBanner from "./NewAgentBanner";
const Plot = lazy(() => import("react-plotly.js"));
const RenderMarkdown = lazy(() => import("./RenderMarkdown"));
import styled, { keyframes } from "styled-components";

const typeAnimation = keyframes`
  0% { width: 0 }
  50% { width: 100% }
  100% { width: 0 }
`;

const AnimatedText = styled.div`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  animation: ${typeAnimation} 6s linear infinite;
`;

const NewAgent = () => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [accumulatedText, setAccumulatedText] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const threadId = useRef(uuidv4());
  const [parsedData, setParsedData] = useState({});
  const currentArtifacts = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const responseRef = useRef(null);
  const isDarkMode = localStorage.getItem("mode") === "dark";
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [shouldSubmit, setShouldSubmit] = useState(false);

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

  useEffect(() => {
    if (shouldSubmit && speechTranscript) {
      handleSubmit({ preventDefault: () => {} });
      setShouldSubmit(false);
    }
  }, [shouldSubmit, speechTranscript]);

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

  const handleSpeechToText = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechTranscript("");
      setShouldSubmit(false);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setPrompt(text);
      setSpeechTranscript(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setShouldSubmit(true);
    };

    recognition.start();
  };

  const renderEvent = (event, index) => {
    switch (event.type) {
      case "plotly_fig":
        try {
          const plotData = JSON.parse(event.content);
          // console.log("Plot Data", plotData.layout);
          return (
            <Suspense
              fallback={
                <div style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Loading...
                </div>
              }
            >
              <Plot
                key={index}
                data={plotData.data}
                layout={{
                  ...plotData.layout,
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  font: {
                    color: isDarkMode ? "#ffffff" : "inherit",
                  },
                  title: {
                    ...plotData.layout?.title,
                    font: { color: isDarkMode ? "#ffffff" : "inherit" },
                  },
                }}
                style={{
                  width: "100%",
                  height: "60vh",
                  minHeight: "550px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: isDarkMode
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.1)",
                }}
              />
            </Suspense>
          );
        } catch (error) {
          console.error("Error parsing Plotly data:", error);
          return null;
        }

      case "csv_content":
        const data = parsedData[event.id];
        if (!data) return null;

        if (data.length > 1 && data.length < 10) {
          // Check if this is a devices list by looking for typical device properties
          const isDevicesList = data.some((item) =>
            Object.keys(item).some(
              (key) =>
                key.toLowerCase().includes("device") ||
                key.toLowerCase().includes("id") ||
                key.toLowerCase().includes("name")
            )
          );

          return (
            <div key={index} className="kpi-cards">
              {data.map((dataItem, dataIndex) => {
                const entries = Object.entries(dataItem);
                if (
                  entries.length === 0 ||
                  entries.some(([_, value]) => !value && value !== 0)
                )
                  return null;

                return (
                  <div className="kpi-card" key={dataIndex}>
                    <Tilt
                      key={index}
                      tiltMaxAngleX={17}
                      tiltMaxAngleY={17}
                      glareEnable={false}
                      scale={1.07}
                      transitionSpeed={1000}
                      className="border-effect"
                    >
                      <div
                        className={`device-card ${
                          isDevicesList && dataItem === selectedDevice
                            ? "selected-device"
                            : ""
                        }`}
                        onClick={() => {
                          if (isDevicesList) {
                            setSelectedDevice(dataItem);
                            setPrompt(
                              `Tell me about device ${
                                Object.values(dataItem)[0]
                              }`
                            );
                          }
                        }}
                        style={{
                          cursor: isDevicesList ? "pointer" : "default",
                        }}
                      >
                        {entries.map(([key, value], entryIndex) => (
                          <div key={key}>
                            {entryIndex === 0 ? (
                              <div className="key-value-header">
                                <div
                                  style={{
                                    color: isDarkMode ? "#07F0FF" : "inherit",
                                  }}
                                  className="key-label"
                                >
                                  {key}:
                                </div>
                                <div
                                  style={{
                                    color: isDarkMode ? "#07F0FF" : "inherit",
                                  }}
                                  className="value-text"
                                >
                                  {value}
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  color: isDarkMode ? "#07F0FF" : "inherit",
                                }}
                                className="value-item"
                              >
                                {value}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Tilt>
                  </div>
                );
              })}
            </div>
          );
        }

        // if (data.length > 10) {
        //   const columns = Object.keys(data[0]);
        //   const xColumn = columns[0];
        //   const traces = columns.slice(1).map((column) => ({
        //     type: "scatter",
        //     mode: "lines",
        //     name: column,
        //     x: data.map((row) => row[xColumn]),
        //     y: data.map((row) => row[column]),
        //   }));

        //   return (
        //     <Suspense fallback={<div>Loading...</div>}>
        //       <Plot
        //         className="dataVisulaization"
        //         key={index}
        //         data={traces}
        //         layout={{
        //           title: "Data Visualization",
        //           xaxis: { title: xColumn },
        //           yaxis: { title: "Values" },
        //           height: 500,
        //           width: "100%",
        //           paper_bgcolor: "transparent",
        //           plot_bgcolor: "transparent",
        //         }}
        //       />
        //     </Suspense>
        //   );
        // }
        return null;

      case "html_content":
        return (
          <div
            style={{
              color: isDarkMode ? "#ffffff" : "inherit",
              padding: "5px",
            }}
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

  const TypingIndicator = () => {
    const memoizedTypingIndicator = useMemo(
      () => (
        // <div className="loader"></div>
        <div className="message">
          <div className="typing-indicator">
            <div className="typing-indicator-dot"></div>
            <div className="typing-indicator-dot"></div>
            <div className="typing-indicator-dot"></div>
          </div>
        </div>
      ),
      []
    );
    return memoizedTypingIndicator;
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        height: "69vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="mainContent"
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
        {/* Agent Header */}
        <div className="agent-header">
          {/* <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NewAgentBanner />
          </div> */}

          {isDarkMode ? (
            <div className="card">
              <AnimatedText>
                Welcome to Telematics Agent, How can I assist you?
              </AnimatedText>
            </div>
          ) : (
            <>
              <h1>Telematics Analytics Agent</h1>
              <div className="example-commands">
                <p className="example-label">💡 Example commands:</p>
                <ul style={{ listStyleType: "disc", marginLeft: "19px" }}>
                  <li>"Plot last ride data of device 7 for last week"</li>
                  <li>"Create a visualization of speed over time"</li>
                  <li>"Show summarized metrics for vehicle position data"</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Chat Messages */}
        <div style={{ marginBottom: "30px", marginTop: "40px" }}>
          {messages.map((msg, index) => {
            if (msg.role === "user") {
              return (
                <div key={index} className={`message user-message ${msg.role}`}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <div
                      className="message-avatar"
                      style={{ color: isDarkMode ? "#ffffff" : "inherit" }}
                    >
                      <FaRegUserCircle style={{ marginTop: "3px" }} size={20} />
                    </div>
                    <div style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                      <Suspense
                        fallback={
                          <div
                            style={{
                              color: isDarkMode ? "#ffffff" : "inherit",
                            }}
                          >
                            Loading...
                          </div>
                        }
                      >
                        <RenderMarkdown content={msg.content} />
                      </Suspense>
                    </div>
                  </div>
                  <div
                    className="timestamp"
                    style={{ color: isDarkMode ? "#ffffff" : "inherit" }}
                  >
                    {msg.timestamp}
                  </div>
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
                    <div
                      className="message-avatar"
                      style={{ color: isDarkMode ? "#ffffff" : "inherit" }}
                    >
                      <BsRobot size={20} />
                    </div>
                    <div style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <RenderMarkdown content={msg.content} />
                      </Suspense>
                    </div>
                  </div>
                  {msg.artifacts?.map((artifact, artifactIndex) =>
                    renderEvent(artifact, `${index}-${artifactIndex}`)
                  )}
                  <div
                    className="timestamp"
                    style={{ color: isDarkMode ? "#ffffff" : "inherit" }}
                  >
                    {msg.timestamp}
                  </div>
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
            {isDarkMode ? <div className="gradient-div"></div> : ""}

            <button
              type="button"
              onClick={handleSpeechToText}
              style={{
                position: "absolute",
                left: "12px",
                top: "8px",
                width: "35px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "linear-gradient(90deg, #4633eb, #7a35eb)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                zIndex: 2,
                transition: "transform 0.2s ease",
                boxShadow: "0 0 15px rgba(70, 51, 235, 0.3)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  animation: isListening ? "pulse 1.5s infinite" : "none",
                }}
              >
                <Mic size={20} />
              </span>
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me about your data..."
              className="prompt-input"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px 24px",
                paddingLeft: "55px",
                paddingRight: "55px",
                fontSize: "16px",
                borderRadius: "100px",
                border: `${
                  isDarkMode
                    ? "1px solid rgba(255, 255, 255, 0)"
                    : "1px solid rgb(222, 225, 228)"
                }`,
                backgroundColor: `${isDarkMode ? "rgb(8, 9, 24)" : "#ffffff"}`,
                outline: "none",
                color: `${isDarkMode ? "#fff" : "inherit"}`,
                position: "relative",
                zIndex: "1",
                backdropFilter: "blur(8px)",
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
              style={{
                position: "absolute",
                right: "12px",
                top: "8px",
                width: "35px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "linear-gradient(90deg, #4633eb, #7a35eb)",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                color: "#fff",
                zIndex: 2,
                transition: "transform 0.2s ease",
                boxShadow: "0 0 15px rgba(70, 51, 235, 0.3)",
              }}
            >
              <span style={{ display: "flex" }}>
                <ArrowRight size={20} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAgent;
