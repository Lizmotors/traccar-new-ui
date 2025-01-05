export default function MaxSpeed({ vehicleData }) {
	return (
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

	)
}
