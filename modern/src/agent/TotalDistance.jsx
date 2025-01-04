export default function TotalDistance({ vehicleData }) {
	return (
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
	)
}
