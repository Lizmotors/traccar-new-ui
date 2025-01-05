import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Plot from 'react-plotly.js';
import Papa from 'papaparse'

const parseCSVToData = (csvString) => {
	return new Promise((resolve) => {
		Papa.parse(csvString, {
			header: true,
			complete: (results) => {
				resolve(results.data);
			}
		});
	});
};

const NewAgent = () => {
	const [messages, setMessages] = useState([]);
	const [events, setEvents] = useState([]);
	const [prompt, setPrompt] = useState("");
	const [accumulatedText, setAccumulatedText] = useState("");
	const threadId = useRef(uuidv4());
	const [parsedData, setParsedData] = useState({});
	useEffect(() => {
		const parseCSVEvents = async () => {
			const newParsedData = { ...parsedData };

			for (const event of events) {
				if (event.type === "csv_content" && !parsedData[event.id]) {
					const parseResult = await new Promise((resolve) => {
						Papa.parse(event.content, {
							header: true,
							complete: (results) => resolve(results.data)
						});
					});
					newParsedData[event.id] = parseResult;
				}
			}

			setParsedData(newParsedData);
		};

		parseCSVEvents();
	}, [events]);
	const addMessage = (role, content, timestamp = new Date().toLocaleTimeString()) => {
		setMessages(prev => [...prev, { role, content, timestamp }]);
	};

	const updateAssistantMessage = (content) => {
		setMessages(prev => {
			const newMessages = [...prev];
			if (newMessages.length > 0) {
				newMessages[newMessages.length - 1] = {
					...newMessages[newMessages.length - 1],
					content
				};
			}
			return newMessages;
		});
	};

	const handleSSEEvent = (data) => {
		switch (data.type) {
			case "token":
				setAccumulatedText(prev => {
					const newText = prev + (data.content || "");
					updateAssistantMessage(newText + "▌");
					return newText;
				});
				break;

			case "tool_start":
				const toolStartMessage = `Running: ${data.tool}`;
				addMessage("system", toolStartMessage);
				setEvents(prev => [...prev, {
					type: "tool_start",
					content: data.tool,
					input: data.input
				}]);

				// Handle specific tool visualizations
				if (data.tool === "create_visualization" || data.tool === "execute_sql_query") {
					try {
						const inputData = JSON.parse(data.input);
						if (inputData.sql_query) {
							addMessage("system", "SQL Query:", inputData.sql_query);
						}
						if (inputData.plotly_code) {
							addMessage("system", "Plotly Code:", inputData.plotly_code);
						}
					} catch (e) {
						console.warn("Failed to parse tool input:", e);
					}
				}
				break;

			case "tool_end":
				const toolEndMessage = `Result: ${data.output}`;
				addMessage("system", toolEndMessage);
				setEvents(prev => [...prev, {
					type: "tool_end",
					content: data.output
				}]);
				break;

			case "artifact":
				if (data["plotly_fig/json"]) {
					setEvents(prev => [...prev, {
						type: "plotly_fig",
						content: data["plotly_fig/json"]
					}]);
				}
				if (data["text/html"]) {
					setEvents(prev => [...prev, {
						type: "html_content",
						content: data["text/html"]
					}]);
				}
				if (data["text/csv"]) {
					setEvents(prev => [...prev, {
						type: "csv_content",
						content: data["text/csv"]
					}]);
				}
				break;

			default:
				console.warn("Unknown SSE event type:", data.type);
		}
	};

	const processStreamResponse = async (response) => {
		const reader = response.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";

		// Add initial empty assistant message
		addMessage("assistant", "");
		setAccumulatedText("");

		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value);
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.trim() && line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							handleSSEEvent(data);
						} catch (error) {
							console.warn("Failed to parse SSE JSON:", error);
						}
					}
				}
			}
		} catch (error) {
			console.error("Error processing stream:", error);
			addMessage("system", `Error processing response: ${error.message}`);
		} finally {
			// Final update without cursor
			if (accumulatedText) {
				updateAssistantMessage(accumulatedText);
			}
		}
	};

	const handleSubmit = async () => {
		if (!prompt.trim()) return;

		try {
			addMessage("user", prompt);

			const response = await fetch("https://api1001.elevatics.online/chat", {
				method: "POST",
				headers: {
					"Accept": "text/event-stream",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: prompt,
					thread_id: threadId.current
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			await processStreamResponse(response);
		} catch (error) {
			console.error("Submission error:", error);
			addMessage("system", `Error: ${error.message}`);
		} finally {
			setPrompt("");
		}
	};

	const renderEvent = (event, index) => {
		switch (event.type) {
			case "plotly_fig":
				try {
					const plotData = JSON.parse(event.content);
					return (
						<Plot
							key={event.id}
							data={plotData.data}
							layout={plotData.layout}
							style={{ width: '100%', height: '500px' }}
						/>
					);
				} catch (error) {
					console.error("Error parsing Plotly data:", error);
					return null;
				}

			case "csv_content":
				const data = parsedData[event.id];
				if (!data) return null; // Still loading

				if (data.length === 1) {
					// Render KPI cards
					return (
						<div key={event.id} className="kpi-cards">
							{Object.entries(data[0]).map(([key, value]) => (
								<div className="kpi-card" key={key}>
									<h3>{key}</h3>
									<p>{value}</p>
								</div>
							))}
						</div>
					);
				}

				// Render line chart for time series data
				if (data.length > 1) {
					const columns = Object.keys(data[0]);
					const xColumn = columns[0];
					const traces = columns.slice(1).map(column => ({
						type: 'scatter',
						mode: 'lines',
						name: column,
						x: data.map(row => row[xColumn]),
						y: data.map(row => row[column])
					}));

					return (
						<Plot
							key={event.id}
							data={traces}
							layout={{
								title: 'Data Visualization',
								xaxis: { title: xColumn },
								yaxis: { title: 'Values' },
								height: 500,
								width: '100%'
							}}
						/>
					);
				}
				return null;
			case "html_content":
				return <div
					style={{ padding: "5px", background: 'red' }}
					key={index}
					className="html-content"
					dangerouslySetInnerHTML={{ __html: event.content }}
				/>;

			default:
				return null;
		}
	};

	return (
		<div className="telematics-agent" style={{ width: "100%", display: "flex", flexDirection: 'column', gap: "20px", alignItems: "center", justifyContent: "center" }}>
			<div style={{ width: "900px", height: "600px", overflow: 'scroll', display: "flex", flexDirection: 'column', gap: "10px" }} className="chat-container">
				{messages.map((msg, index) => {
					if (msg.role === "user") {
						return (
							<div style={{ background: "red", padding: "5px" }} key={index} className={`chat-message ${msg.role}`}>
								<div className="message-content">{msg.content}</div>
								<div className="timestamp">{msg.timestamp}</div>
							</div>

						)
					}

					if (msg.role === "assistant") {
						return (
							<div style={{ background: "green", padding: "5px" }} key={index} className={`chat-message ${msg.role}`}>
								<div className="message-content">{msg.content}</div>
								<div className="timestamp">{msg.timestamp}</div>
							</div>

						)

					}

					return (
						<div style={{ background: "blue", padding: "5px" }} className="events-container">
							{events.map((event, index) => renderEvent(event, index))}
						</div>
					)
				})}
			</div>


			<div className="input-container">
				<input
					type="text"
					className="chat-input"
					placeholder="Ask me about your data..."
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
				/>
				<button onClick={handleSubmit}>Send</button>
			</div>
		</div>
	);
};

export default NewAgent;
