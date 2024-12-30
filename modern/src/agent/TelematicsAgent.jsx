import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Plot from 'react-plotly.js';
import { v4 as uuidv4 } from 'uuid';

export default function TelematicsAgent() {
	const [messages, setMessages] = useState([]);
	const [threadId] = useState(uuidv4());
	const [sseEvents, setSseEvents] = useState([]);
	const [inputMessage, setInputMessage] = useState('');
	const chatEndRef = useRef(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, sseEvents]);

	const parseSSELine = (line) => {
		if (line.startsWith('data: ')) {
			try {
				return JSON.parse(line.slice(6));
			} catch {
				return null;
			}
		}
		return null;
	};

	const renderVisualization = (htmlContent) => {
		return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="h-[500px] overflow-auto" />;
	};

	const renderPlotlyFigure = (content) => {
		try {
			const plotData = typeof content === 'string' ? JSON.parse(content) : content;
			return <Plot
				data={plotData.data || []}
				layout={plotData.layout || { autosize: true }}
				className="w-full h-[500px]"
			/>;
		} catch (error) {
			console.error('Error parsing Plotly data:', error);
			return <div className="text-red-500">Error rendering visualization</div>;
		}
	};

	const processStreamResponse = async (response) => {
		const reader = response.body.getReader();
		let accumulatedText = '';
		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');
				console.log(chunk)
				for (const line of lines) {
					if (!line) continue;

					const eventData = parseSSELine(line);
					if (!eventData) continue;

					switch (eventData.type) {
						case 'token':
							accumulatedText += eventData.content;
							setMessages(prev => {
								const newMessages = [...prev];
								if (newMessages.length && newMessages[newMessages.length - 1].role === 'assistant') {
									newMessages[newMessages.length - 1].content = accumulatedText;
								} else {
									newMessages.push({
										role: 'assistant',
										content: accumulatedText,
										timestamp: format(new Date(), 'HH:mm')
									});
								}
								return newMessages;
							});
							break;

						case 'tool_start':
							setSseEvents(prev => [...prev, {
								type: 'info',
								content: `Running: ${eventData.tool}`,
								timestamp: format(new Date(), 'HH:mm')
							}]);
							break;

						case 'tool_end':
							setSseEvents(prev => [...prev, {
								type: 'success',
								content: eventData.output,
								timestamp: format(new Date(), 'HH:mm')
							}]);
							break;

						case 'artifact':
							if (eventData['plotly_fig/json']) {
								setSseEvents(prev => [...prev, {
									type: 'plotly',
									content: eventData['plotly_fig/json'],
									timestamp: format(new Date(), 'HH:mm')
								}]);
							} else if (eventData['text/html']) {
								setSseEvents(prev => [...prev, {
									type: 'html',
									content: eventData['text/html'],
									timestamp: format(new Date(), 'HH:mm')
								}]);
							} else if (eventData['text/csv']) {
								setSseEvents(prev => [...prev, {
									type: 'csv',
									content: eventData['text/csv'],
									timestamp: format(new Date(), 'HH:mm')
								}]);
							}
							break;
					}
				}
			}
		} catch (error) {
			console.error('Error processing stream:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputMessage.trim()) return;

		const newMessage = {
			role: 'user',
			content: inputMessage,
			timestamp: format(new Date(), 'HH:mm')
		};
		setMessages(prev => [...prev, newMessage]);
		setInputMessage('');

		try {
			const response = await fetch('https://api1001.elevatics.online/chat', {
				method: 'POST',
				headers: {
					'Accept': 'text/event-stream',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: inputMessage,
					thread_id: threadId
				})
			});

			if (response.ok) {
				await processStreamResponse(response);
			} else {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Connection error:', error);
			setMessages(prev => [...prev, {
				role: 'error',
				content: 'Failed to connect to the server. Please try again.',
				timestamp: format(new Date(), 'HH:mm')
			}]);
		}
	};

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<h1 className="text-3xl font-bold mb-6">Vehicle Telematics Analytics Agent</h1>

			<div className="bg-gray-100 p-4 rounded-lg mb-6">
				<p className="font-semibold">💡 Example commands:</p>
				<ul className="list-disc pl-6">
					<li>Plot last ride data of device 7 for last week</li>
					<li>Create a visualization of speed over time</li>
					<li>Show summarized metrics for vehicle position data</li>
				</ul>
			</div>

			<div className="bg-white rounded-lg shadow-lg p-4 mb-6 h-[600px] overflow-y-auto">
				{messages.map((message, index) => (
					<div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
						<div className={`inline-block max-w-[70%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' :
							message.role === 'error' ? 'bg-red-500 text-white' :
								'bg-gray-200'
							}`}>
							<p>{message.content}</p>
							<p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
						</div>
					</div>
				))}

				{sseEvents.map((event, index) => (
					<div key={`event-${index}`} className="mb-4">
						{event.type === 'info' && (
							<div className="bg-blue-100 text-blue-800 p-2 rounded">{event.content}</div>
						)}
						{event.type === 'success' && (
							<div className="bg-green-100 text-green-800 p-2 rounded">{event.content}</div>
						)}
						{event.type === 'plotly' && (
							<div className="border rounded p-4">
								{renderPlotlyFigure(event.content)}
							</div>
						)}
						{event.type === 'html' && (
							<div className="border rounded p-4">
								{renderVisualization(event.content)}
							</div>
						)}
						{event.type === 'csv' && (
							<div className="border rounded p-4 overflow-x-auto">
								<pre>{event.content}</pre>
							</div>
						)}
					</div>
				))}
				<div ref={chatEndRef} />
			</div>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					placeholder="Ask me about your data..."
					className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					Send
				</button>
			</form>
		</div>
	);
};

