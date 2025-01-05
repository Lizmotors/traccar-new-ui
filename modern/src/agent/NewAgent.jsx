import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Plot from 'react-plotly.js';
import Papa from 'papaparse'

const NewAgent = () => {
	const [messages, setMessages] = useState([]);
	const [prompt, setPrompt] = useState("");
	const [accumulatedText, setAccumulatedText] = useState("");
	const threadId = useRef(uuidv4());
	const [parsedData, setParsedData] = useState({});
	const currentArtifacts = useRef([]);

	useEffect(() => {
		const parseCSVEvents = async () => {
			const newParsedData = { ...parsedData };

			for (const message of messages) {
				if (message.artifacts) {
					for (const artifact of message.artifacts) {
						if (artifact.type === "csv_content" && !parsedData[artifact.id]) {
							const parseResult = await new Promise((resolve) => {
								Papa.parse(artifact.content, {
									header: true,
									complete: (results) => resolve(results.data)
								});
							});
							newParsedData[artifact.id] = parseResult;
						}
					}
				}
			}

			setParsedData(newParsedData);
		};

		parseCSVEvents();
	}, [messages]);

	const addMessage = (role, content, timestamp = new Date().toLocaleTimeString()) => {
		setMessages(prev => [...prev, { role, content, timestamp, artifacts: [] }]);
	};

	const processStreamResponse = async (response) => {
		const reader = response.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";

		currentArtifacts.current = [];

		setMessages(prev => [...prev, {
			role: "assistant",
			content: "",
			timestamp: new Date().toLocaleTimeString(),
			artifacts: []
		}]);
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
			if (accumulatedText) {
				setMessages(prev => {
					const newMessages = [...prev];
					const lastMessage = newMessages[newMessages.length - 1];
					newMessages[newMessages.length - 1] = {
						...lastMessage,
						content: accumulatedText,
						artifacts: currentArtifacts.current
					};
					return newMessages;
				});
			}
		}
	};

	const handleSSEEvent = (data) => {
		switch (data.type) {
			case "token":
				setAccumulatedText(prev => {
					const newText = prev + (data.content || "");
					setMessages(prev => {
						const newMessages = [...prev];
						if (newMessages.length > 0) {
							const lastMessage = newMessages[newMessages.length - 1];
							newMessages[newMessages.length - 1] = {
								...lastMessage,
								content: newText + "▌",
								artifacts: currentArtifacts.current
							};
						}
						return newMessages;
					});
					return newText;
				});
				break;

			case "artifact":
				const newArtifact = {};
				if (data["plotly_fig/json"]) {
					newArtifact.type = "plotly_fig";
					newArtifact.content = data["plotly_fig/json"];
				} else if (data["text/html"]) {
					newArtifact.type = "html_content";
					newArtifact.content = data["text/html"];
				} else if (data["text/csv"]) {
					newArtifact.type = "csv_content";
					newArtifact.content = data["text/csv"];
					newArtifact.id = uuidv4();
				}

				if (Object.keys(newArtifact).length > 0) {
					currentArtifacts.current = [...currentArtifacts.current, newArtifact];
					setMessages(prev => {
						const newMessages = [...prev];
						const lastMessage = newMessages[newMessages.length - 1];
						newMessages[newMessages.length - 1] = {
							...lastMessage,
							artifacts: currentArtifacts.current
						};
						return newMessages;
					});
				}
				break;

			case "tool_start":
				if (data.tool === "create_visualization" || data.tool === "execute_sql_query") {
					try {
						const inputData = JSON.parse(data.input);
						const toolArtifact = {
							type: 'tool_start',
							tool: data.tool,
							sql_query: inputData.sql_query,
							plotly_code: inputData.plotly_code
						};
						currentArtifacts.current = [...currentArtifacts.current, toolArtifact];
						setMessages(prev => {
							const newMessages = [...prev];
							const lastMessage = newMessages[newMessages.length - 1];
							newMessages[newMessages.length - 1] = {
								...lastMessage,
								artifacts: currentArtifacts.current
							};
							return newMessages;
						});
					} catch (e) {
						console.warn("Failed to parse tool input:", e);
					}
				}
				break;

			default:
				console.warn("Unknown SSE event type:", data.type);
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
							key={index}
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
				if (!data) return null;

				if (data.length === 1) {
					return (
						<div key={index} className="kpi-cards">
							{Object.entries(data[0]).map(([key, value]) => (
								<div className="kpi-card" key={key}>
									<h3>{key}</h3>
									<p>{value}</p>
								</div>
							))}
						</div>
					);
				}

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
							key={index}
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

			case "tool_start":
				return (
					<div key={index}>
						{event.sql_query && (
							<pre className="sql-query">
								{event.sql_query}
							</pre>
						)}
						{event.plotly_code && (
							<pre className="plotly-code">
								{event.plotly_code}
							</pre>
						)}
					</div>
				);

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
						);
					}

					if (msg.role === "assistant") {
						return (
							<div style={{ background: "green", padding: "5px" }} key={index} className={`chat-message ${msg.role}`}>
								<div className="message-content">{msg.content}</div>
								{msg.artifacts?.map((artifact, artifactIndex) =>
									renderEvent(artifact, `${index}-${artifactIndex}`)
								)}
								<div className="timestamp">{msg.timestamp}</div>
							</div>
						);
					}

					return null;
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
