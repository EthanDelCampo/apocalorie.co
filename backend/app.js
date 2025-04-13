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
const filePath = 'selected_foods.json';
const foodIndex = new Map();

// Search endpoint for food inventory
app.post('/api/search', async (req, res) => {
	console.log('Received search request:', req.body);
	try {
		const searchTerm = req.body.name?.toLowerCase();
		if (!searchTerm) {
			return res.status(400).json({ error: 'Search term is required' });
		}

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			console.error(`File not found: ${filePath}`);
			return res.status(500).json({ error: 'Food database not available' });
		}

		const matches = [];
		const maxMatches = 1000;
		let errorCount = 0;

		// Read the entire file
		const fileContent = fs.readFileSync(filePath, 'utf8');

		try {
			// Parse the entire JSON array
			const foodData = JSON.parse(fileContent);

			// Process each item in the BrandedFoods array
			for (const entry of foodData.BrandedFoods) {
				try {
					// Check both descriptions array and description field
					let hasMatch = false;

					if (entry.descriptions && Array.isArray(entry.descriptions)) {
						hasMatch = entry.descriptions.some(desc =>
							desc.toLowerCase().includes(searchTerm)
						);
					} else if (entry.description) {
						hasMatch = entry.description.toLowerCase().includes(searchTerm);
					}

					if (hasMatch) {
						matches.push({
							entry: entry
						});

						if (matches.length >= maxMatches) {
							console.log('Reached max matches limit');
							break;
						}
					}
				} catch (e) {
					errorCount++;
					if (errorCount % 100 === 0) {
						console.error('Error processing entry:', e.message);
					}
					continue;
				}
			}

			console.log(`Search completed. Found ${matches.length} matches, encountered ${errorCount} errors`);

			res.json({
				results: matches,
				count: matches.length,
				truncated: matches.length >= maxMatches,
				stats: {
					totalEntries: foodData.BrandedFoods.length,
					errorsEncountered: errorCount
				}
			});
		} catch (parseError) {
			console.error('Error parsing JSON file:', parseError);
			res.status(500).json({
				error: 'Failed to parse food database',
				details: parseError.message
			});
		}
	} catch (error) {
		console.error('Search endpoint error:', error);
		res.status(500).json({
			error: 'Failed to process search request',
			details: error.message
		});
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

		// If Gemini is enabled, generate recommendations in the background
		if (useGemini) {
			try {
				const prompt = `Given a person with the following characteristics: ${height} inches, ${weight} lbs, ${sex}, ${activityLevel}, ${age}, ${location}. 								
                                Provide a list of edible plants or natural resources that users can forage for based on their location, formatted as follows:
                                - First line: Food name, with common name and scientific name in parentheses followed by a colon, e.g., "Spanish Needles (Bidens alba): "						
                                - Second line: A few sentences describing where to find it safely.
                                - Third line: A few sentences explaining how to identify it.
                                - Fourth line: A few sentences describing any important warnings about toxic look-alikes.
								- Leave one blank line between the second, third, and fourth lines.
                                - Then two blank lines before the next food.

								Do NOT use any HTML or special formatting. Just plain text with one blank line between each item.

								Keep it concise and factual. Avoid long essays. Second-person perspective ("you can find...").

								DO NOT make it an essay, not too long please.`

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
