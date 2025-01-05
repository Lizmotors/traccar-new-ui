export default function AvgSpeed({ vehicleData }) {
	return (
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

	)
}
