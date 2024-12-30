import React, { useState } from 'react';

export default function AgentChat() {
	const [output, setOutput] = useState([]);

	const styles = {
		container: {
			padding: '20px',
		},
		output: {
			whiteSpace: 'pre-wrap',
			fontFamily: 'monospace',
			padding: '10px',
			border: '1px solid #ccc',
			margin: '10px 0',
			maxHeight: '400px',
			overflowY: 'auto',
		},
		chunk: {
			margin: '5px 0',
			padding: '5px',
			backgroundColor: '#f5f5f5',
			borderRadius: '4px',
		}
	};

	const sendRequest = async () => {
		setOutput(['Sending request...']);
		try {
			const response = await fetch('https://api1001.elevatics.online/chat', {
				method: 'POST',
				headers: {
					'accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: "Create a visualization of speed over time",
					thread_id: "string1"
				})
			});

			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				console.log(chunk)
				try {
					//const jsonChunk = JSON.parse(chunk);

					//setOutput(prev => [...prev, jsonChunk]);
				} catch (e) {
					console.error('Error parsing chunk:', e);
					//setOutput(prev => [...prev, { error: chunk }]);
				}
			}
		} catch (error) {
			setOutput(prev => [...prev, `Error: ${error.message}`]);
		}
	};

	return (
		<div style={styles.container}>
			<h2>Chat API Response Viewer</h2>
			<button onClick={sendRequest}>Send Request</button>
			<div style={styles.output}>
				{output.map((chunk, index) => (
					<div key={index} style={styles.chunk}>
						{typeof chunk === 'object'
							? JSON.stringify(chunk, null, 2)
							: chunk}
					</div>
				))}
			</div>
		</div>
	);
};

