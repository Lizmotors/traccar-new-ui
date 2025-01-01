import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { FaRegUserCircle } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Line } from "react-chartjs-2";
import "./styles/AgentResponse.css";

const GOOGLE_MAPS_API_KEY = "AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU";

export default function TelematicsAgentResponse({
  messages,
  isTyping,
  vehicleData,
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

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

  const center =
    vehicleData.length > 0
      ? {
          lat: parseFloat(vehicleData[0].latitude),
          lng: parseFloat(vehicleData[0].longitude),
        }
      : {
          lat: 37.7749,
          lng: -122.4194,
        };

  const path = vehicleData.map((point) => ({
    lat: parseFloat(point.latitude),
    lng: parseFloat(point.longitude),
  }));

  const speedData = {
    labels: vehicleData.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: "Speed",
        data: vehicleData.map((point) => {
          const speed = parseFloat(point.speed);
          return isNaN(speed) ? 0 : speed;
        }),
        borderColor: "#4285F4",
        backgroundColor: "rgba(66, 133, 244, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const altitudeData = {
    labels: vehicleData.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: "Altitude",
        data: vehicleData.map((point) => {
          const altitude = parseFloat(point.altitude);
          return isNaN(altitude) ? 0 : altitude;
        }),
        borderColor: "#34A853",
        backgroundColor: "rgba(52, 168, 83, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Speed: ${context.parsed.y.toFixed(1)} km/h`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f5f5f5",
        },
        ticks: {
          callback: function (value) {
            return value + " km/h";
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  // console.log("Messages are: =>", messages);
  // console.log("Vehicle data are: =>", vehicleData);
  return (
    <div>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.role === "user" ? "user-message" : "assistant-message"
          }`}
        >
          <div style={{ display: "flex" }}>
            <div className="message-avatar">
              {msg.role === "user" ? (
                <FaRegUserCircle style={{ marginTop: "3px" }} size={20} />
              ) : (
                <BsRobot size={20} />
              )}
            </div>
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      style={{ maxWidth: "100%", height: "auto" }}
                      {...props}
                      loading="lazy"
                    />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
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
              {/* Map Visualization */}
              {isLoaded && (
                <div
                  style={{
                    height: "350px",
                    marginBottom: "16px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    Vehicle Route
                  </h3>
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "calc(100% - 32px)",
                      borderRadius: "4px",
                    }}
                    center={center}
                    zoom={9}
                    options={{
                      styles: [
                        {
                          featureType: "all",
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#495057" }],
                        },
                      ],
                      mapTypeControl: true,
                      streetViewControl: true,
                      fullscreenControl: true,
                    }}
                  >
                    {path.map((point, index) => (
                      <Marker
                        key={index}
                        position={point}
                        label={
                          index === 0
                            ? "S"
                            : index === path.length - 1
                            ? "E"
                            : ""
                        }
                      />
                    ))}
                    <Polyline
                      path={path}
                      options={{
                        strokeColor: "#4285F4",
                        strokeWeight: 5,
                        strokeOpacity: 1,
                      }}
                    />
                  </GoogleMap>
                </div>
              )}

              {/* Speed Chart */}
              <div
                style={{
                  height: "350px",
                  marginBottom: "16px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "16px",
                    color: "#333",
                  }}
                >
                  Speed Over Time
                </h3>
                <div style={{ height: "calc(100% - 32px)" }}>
                  <Line
                    data={speedData}
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          titleColor: "#333",
                          bodyColor: "#666",
                          borderColor: "#e0e0e0",
                          borderWidth: 1,
                          padding: 12,
                          displayColors: false,
                          callbacks: {
                            label: function (context) {
                              return `Speed: ${context.parsed.y.toFixed(
                                1
                              )} km/h`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "#f5f5f5",
                          },
                          ticks: {
                            callback: function (value) {
                              return value + " km/h";
                            },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            maxTicksLimit: 10,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Altitude Chart */}
              <div
                style={{
                  height: "350px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "16px",
                    color: "#333",
                  }}
                >
                  Altitude Over Time
                </h3>
                <div style={{ height: "calc(100% - 32px)" }}>
                  <Line
                    data={altitudeData}
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          titleColor: "#333",
                          bodyColor: "#666",
                          borderColor: "#e0e0e0",
                          borderWidth: 1,
                          padding: 12,
                          displayColors: false,
                          callbacks: {
                            label: function (context) {
                              return `Altitude: ${context.parsed.y.toFixed(
                                1
                              )} m`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "#f5f5f5",
                          },
                          ticks: {
                            callback: function (value) {
                              return value + " m";
                            },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            maxTicksLimit: 10,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Key Metrics Section */}
              {vehicleData.length > 0 && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.1)",
                    padding: "16px",
                    marginBottom: "16px",
                    marginTop: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "16px",
                      color: "#1f2937",
                    }}
                  >
                    Key Metrics
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {/* Average Speed */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Average Speed
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {(
                          vehicleData.reduce(
                            (acc, curr) => acc + parseFloat(curr.speed),
                            0
                          ) / vehicleData.length
                        ).toFixed(1)}{" "}
                        km/h
                      </div>
                    </div>

                    {/* Max Speed */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Max Speed
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {Math.max(
                          ...vehicleData.map((item) => parseFloat(item.speed))
                        ).toFixed(1)}{" "}
                        km/h
                      </div>
                    </div>

                    {/* Total Distance */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Total Distance
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {vehicleData
                          .reduce((acc, curr, idx, arr) => {
                            if (idx === 0) return 0;
                            const timeDiff =
                              (new Date(curr.servertime) -
                                new Date(arr[idx - 1].servertime)) /
                              3600000; // hours
                            const avgSpeed =
                              (parseFloat(curr.speed) +
                                parseFloat(arr[idx - 1].speed)) /
                              2;
                            return acc + avgSpeed * timeDiff;
                          }, 0)
                          .toFixed(1)}{" "}
                        km
                      </div>
                    </div>

                    {/* Trip Duration */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Trip Duration
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          marginTop: "4px",
                        }}
                      >
                        {(() => {
                          const duration =
                            (new Date(
                              vehicleData[vehicleData.length - 1].servertime
                            ) -
                              new Date(vehicleData[0].servertime)) /
                            1000;
                          const hours = Math.floor(duration / 3600);
                          const minutes = Math.floor((duration % 3600) / 60);
                          return `${hours}h ${minutes}m`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
