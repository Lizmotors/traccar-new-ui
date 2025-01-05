import React, { memo, useEffect } from "react";
import { BsRobot } from "react-icons/bs";
import "./styles/AgentResponse.css";
import SpeedChart from "./SpeedChart";
import AltitudeChart from "./AltitudeChart";
import RenderMap from "./RenderMap";
import MetricsSection from "./MetricsSection";
import RenderMarkdown from "./RenderMarkdown";

export default function BotMessage({ msg, vehicleData }) {

	return (
		<div
			className={`message assistant-message`}
		>
			<div style={{ display: "flex", gap: "5px" }}>
				<div className="message-avatar">
					<BsRobot size={20} />
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
			{vehicleData.length > 0 ? (
				<div
					style={{ marginTop: "16px", width: "100%" }}
				>
					<RenderMap vehicleData={vehicleData} />
					<SpeedChart vehicleData={vehicleData} />
					<AltitudeChart vehicleData={vehicleData} />
					<MetricsSection vehicleData={vehicleData} />
				</div>

			) : null}
		</div>
	);
}





