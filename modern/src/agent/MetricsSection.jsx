import AvgSpeed from "./AvgSpeed"
import MaxSpeed from "./MaxSpeed"
import TotalDistance from "./TotalDistance"
import TripDuration from "./TripDuration"

export default function MetricsSection({ vehicleData }) {
	if (vehicleData.length === 0) return null
	return (
		<div
			style={{
				backgroundColor: "white",
				borderRadius: "8px",
				boxShadow: "inset rgba(0, 0, 0, 0.1) 0px 0px 4px",
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
				<AvgSpeed vehicleData={vehicleData} />
				{/* Max Speed */}
				<MaxSpeed vehicleData={vehicleData} />
				{/* Total Distance */}
				<TotalDistance vehicleData={vehicleData} />
				{/* Trip Duration */}
				<TripDuration vehicleData={vehicleData} />

			</div>
		</div>
	)
}
