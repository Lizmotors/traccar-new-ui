import { FaRegUserCircle } from "react-icons/fa";
import RenderMarkdown from "./RenderMarkdown";

export default function UserMessage({ msg }) {
	return (
		<div className="message user-message">
			<div style={{ display: 'flex', gap: "5px" }}>
				<div className="message-avatar">
					<FaRegUserCircle style={{ marginTop: "3px" }} size={20} />
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
		</div>

	)
}
