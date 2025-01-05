import React, { memo, useEffect } from "react";
import "./styles/AgentResponse.css";
import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";


export default function TelematicsAgentResponse({
  messages,
  isTyping,
  vehicleData,
}) {

  return (
    <div>
      {messages.map((msg, index) => {
        if (msg.role === "user") return <UserMessage key={index} msg={msg} />

        return <BotMessage msg={msg} key={index} vehicleData={vehicleData} />
      })}
    </div>
  );
}
