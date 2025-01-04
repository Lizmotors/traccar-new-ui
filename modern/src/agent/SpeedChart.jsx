import { Line } from "react-chartjs-2";

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
				label: function(context) {
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
				callback: function(value) {
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


export default function SpeedChart({ vehicleData }) {
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
	return (
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
									label: function(context) {
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
									callback: function(value) {
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

	)
}
