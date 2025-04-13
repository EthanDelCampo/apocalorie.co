// Filename - backend/app.js

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, GenerativeModel } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');

const app = express();
const ngrok = require('ngrok');

// ngrok
(async function () {
	const url = await ngrok.connect({
		proto: 'http', port: 8080, authtoken: '2veW2JjTsqO3fSqeoHZhTzpPoTl_2TrWsv6Z1vypnNjYpwgit', hostname: 'sweet-literally-pika.ngrok-free.app'
	});
})();

// Configure CORS
app.use(cors({
	origin: '*', // Allow all origins in development
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
	credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

// Basic health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

/* Foods JSON file */
const filePath = 'food.json';
const foodIndex = new Map();

// Search endpoint for food inventory
app.post('/api/search', async (req, res) => {
	console.log('Received search request:', req.body);
	try {
		const searchTerm = req.body.name?.toLowerCase();
		if (!searchTerm) {
			return res.status(400).json({ error: 'Search term is required' });
		}

		const matches = [];
		const maxMatches = 1000; // Limit to prevent memory issues

		// Create read stream
		const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
		let buffer = '';
		let isArrayStarted = false;

		await new Promise((resolve, reject) => {
			readStream
				.on('data', (chunk) => {
					buffer += chunk;
					const lines = buffer.split('\n');
					buffer = lines.pop() || ''; // Keep the last incomplete line

					for (const line of lines) {
						if (!isArrayStarted) {
							if (line.trim() === '[') {
								isArrayStarted = true;
							}
							continue;
						}

						if (line.trim() === ']') {
							resolve();
							return;
						}

						try {
							const entry = JSON.parse(line.trim().replace(/,$/, ''));
							if (entry.food?.toLowerCase().includes(searchTerm)) {
								matches.push(entry);
								if (matches.length >= maxMatches) {
									readStream.destroy();
									resolve();
									return;
								}
							}
						} catch (e) {
							// Skip invalid JSON lines
							continue;
						}
					}
				})
				.on('end', () => {
					if (buffer) {
						try {
							const entry = JSON.parse(buffer.trim().replace(/,$/, ''));
							if (entry.food?.toLowerCase().includes(searchTerm)) {
								matches.push(entry);
							}
						} catch (e) {
							// Skip invalid JSON
						}
					}
					resolve();
				})
				.on('error', reject);
		});

		res.json({
			results: matches,
			count: matches.length,
			truncated: matches.length >= maxMatches
		});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to process file' });
	}
});

app.post('/api/formSubmit', async (req, res) => {
	try {
		const { height, weight, sex, activityLevel, location, age, useGemini = true } = req.body;

		// Calculate caloric intake
		const caloricIntake = calculateCaloricIntake(height, weight, sex, activityLevel, age);

		// Send immediate response with caloric intake
		res.write(JSON.stringify({
			caloricIntake: Math.round(caloricIntake),
			foragingPara: useGemini ? "Thinking..." : "Gemini API is disabled"
		}));

		// Generate Gemini response in the background
		if (useGemini) {
			try {
				const prompt = `Given a person with the following characteristics: ${height} inches, ${weight} lbs, ${sex}, ${activityLevel}, ${age}, ${location}.
								Provide a concise set of bullet points offering realistic foraging strategies tailored to the user's location. 
								Each main bullet should present a specific edible plant or natural resource commonly found in that region, formatted with the common name followed by its scientific name in brackets, if applicable. 
								Under each main bullet, include sub-bullets that offer practical, actionable tips on how and where to forage for the item safely, including detailed descriptions of identifying features and warnings about toxic look-alikes. 
								Use second-person perspective, avoid text styling (no italics, bolding, etc.), and do not repeat the user's location at the beginning of the response. 
								Reference actual plant species, fungi, or typical foraging areas like city parks, coastlines, wooded trails, or urban lots. 
								Avoid generic statements like 'look for berries' unless specifying types and locations. 
								Ensure each tip is practical, accurate, and appropriate for the local terrain and climate. 
								Emphasize the importance of accurate identification and caution users to avoid consuming any plant unless they are certain of its safety.​
								
								Output the response in valid html format so that formatting can be applied in the frontend. Only the inner lists should be unordered. Reduce spacing and remove the html tags from either side of the response. `

				const result = await model.generateContent(prompt);
				const response = await result.response;
				const text = response.text();

				// Send the foraging paragraph as a separate event
				res.write(JSON.stringify({
					foragingPara: text
				}));
			} catch (error) {
				console.error('Error generating Gemini response:', error);
				// Send error message as foraging paragraph
				res.write(JSON.stringify({
					foragingPara: "Unable to generate foraging recommendations at this time."
				}));
			}
		}

		res.end();
	} catch (error) {
		console.error('Error processing form:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

function calculateCaloricIntake(height, weight, sex, activityLevel, age) {
	//Calories = [10×(W×0.453592) +6.25×((12×F + I)×2.54)−5×A + 5]×M
	//Calories = [10×(W×0.453592) +6.25×((12×F + I)×2.54)−5×A−161]×M

	var intActivityLevel = 1000000;
	intActivityLevel = (activityLevel == 'very_active') ? 1.55 : 1.2;

	let kcPerDiem = 0;

	if (sex == 'male') {
		kcPerDiem = (10 * (0.453592 * weight) + 6.25 * (height * 2.54) - 5 * age + 5) * intActivityLevel;
	} else {
		kcPerDiem = (10 * (0.453592 * weight) + 6.25 * (height * 2.54) - 5 * age - 161) * intActivityLevel;
	}

	if (kcPerDiem == null) {
		return 0;
	}

	return kcPerDiem;
}


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
