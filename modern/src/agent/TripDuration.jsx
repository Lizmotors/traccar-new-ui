export default function TripDuration({ vehicleData }) {
	return (
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

	)
}
