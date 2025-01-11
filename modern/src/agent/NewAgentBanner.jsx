import React from "react";
import "./styles/NewAgent.css";

const NewAgentBanner = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 540"
      className="neural-network"
      style={{ paddingLeft: "100px" }}
    >
      <text
        x="250"
        y="60"
        className="title"
        textAnchor="middle"
        fill="#2D3748"
        fontSize="39"
      >
        Telematics
      </text>
      <text
        x="250"
        y="105"
        className="subtitle"
        textAnchor="middle"
        fill="#4A5568"
        fontSize="29"
      >
        AI Agent
      </text>
      <g className="layer-1" transform="translate(0, 140)">
        <circle className="node" cx="60" cy="50" r="3" fill="#FF6B6B" />
        <circle className="node" cx="60" cy="100" r="3" fill="#4ECDC4" />
        <circle className="node" cx="60" cy="150" r="3" fill="#45B7D1" />
        <circle className="node" cx="60" cy="200" r="3" fill="#96CEB4" />
        <circle className="node" cx="60" cy="250" r="3" fill="#D4A5A5" />
      </g>
      <g className="layer-2" transform="translate(0, 140)">
        <circle className="node" cx="180" cy="50" r="3" fill="#9D94FF" />
        <circle className="node" cx="180" cy="100" r="3" fill="#FFB6B9" />
        <circle className="node" cx="180" cy="150" r="3" fill="#957DAD" />
        <circle className="node" cx="180" cy="200" r="3" fill="#7098DA" />
        <circle className="node" cx="180" cy="250" r="3" fill="#86A8E7" />
      </g>
      <g className="layer-3" transform="translate(0, 140)">
        <circle className="node" cx="320" cy="50" r="3" fill="#FF9999" />
        <circle className="node" cx="320" cy="100" r="3" fill="#91D8E4" />
        <circle className="node" cx="320" cy="150" r="3" fill="#FD7272" />
        <circle className="node" cx="320" cy="200" r="3" fill="#82CCDD" />
        <circle className="node" cx="320" cy="250" r="3" fill="#B8E994" />
      </g>
      <g className="layer-4" transform="translate(0, 140)">
        <circle className="node" cx="440" cy="50" r="3" fill="#FF8DC7" />
        <circle className="node" cx="440" cy="100" r="3" fill="#7ED6DF" />
        <circle className="node" cx="440" cy="150" r="3" fill="#E056FD" />
        <circle className="node" cx="440" cy="200" r="3" fill="#686DE0" />
        <circle className="node" cx="440" cy="250" r="3" fill="#30336B" />
      </g>
      <g className="connections" transform="translate(0, 140)">
        <path
          className="connection layer-1-2"
          d="M60,50 C120,50 120,50 180,50"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,50 C120,50 120,100 180,100"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,100 C120,100 120,50 180,50"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,100 C120,100 120,150 180,150"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,150 C120,150 120,100 180,100"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,150 C120,150 120,200 180,200"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,200 C120,200 120,150 180,150"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,200 C120,200 120,250 180,250"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-1-2"
          d="M60,250 C120,250 120,200 180,200"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,50 C250,50 250,50 320,50"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,50 C250,50 250,100 320,100"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,100 C250,100 250,50 320,50"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,150 C250,150 250,150 320,150"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,200 C250,200 250,150 320,150"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,200 C250,200 250,250 320,250"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-2-3"
          d="M180,250 C250,250 250,200 320,200"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,50 C380,50 380,50 440,50"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,50 C380,50 380,100 440,100"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,100 C380,100 380,150 440,150"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,150 C380,150 380,100 440,100"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,200 C380,200 380,200 440,200"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,250 C380,250 380,200 440,200"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="connection layer-3-4"
          d="M320,250 C380,250 380,250 440,250"
          stroke="#6366F1"
          strokeWidth="1"
          fill="none"
        />
      </g>
    </svg>
  );
};

export default NewAgentBanner;
