import {
	GoogleMap,
	Marker,
	Polyline,
	useJsApiLoader,
} from "@react-google-maps/api";
import { Line } from "react-chartjs-2";

const GOOGLE_MAPS_API_KEY = "AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU";

export default function RenderMap({ vehicleData }) {
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: GOOGLE_MAPS_API_KEY,
	});
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

	if (!isLoaded) return null

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

	)
}
