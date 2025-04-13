// Filename - backend/app.js

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

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

// Basic health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.post('/api/formSubmit', async (req, res) => {
	try {
		//console.log('Received form data:', req.body); // Add logging

		const { height, weight, sex, activityLevel, age } = req.body;

		// Validate required fields
		if (!height || !weight || !sex || !activityLevel || !age) {
			//console.log('Missing fields:', { height, weight, sex, activityLevel, age }); // Add logging
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// Calculate caloric intake
		const caloricIntake = calculateCalories({
			height,
			weight,
			sex,
			activityLevel,
			age
		});

		// Return response in the exact format the frontend expects
		res.json({
			foragingPara: "lorem ipsum dolor sit amet",
			caloricIntake: Math.round(caloricIntake)
		});
	} catch (error) {
		console.error('Error processing form:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});



function calculateCalories(data) {
	const { age, weight, height, sex, activityLevel } = data;

	//[665 +(6.23×W)+(12.7×(12×F+I))−(6.8×A)]×M], if G=male
	//[655 + (4.35×W) +(4.7×(12×F + I))−(4.7×A)]×M], if G = female

	var intActivityLevel = 1000000;
	intActivityLevel = (activityLevel == 'very_active') ? 1.75 : 1.25;

	let kcPerDiem = 0;

	if (sex == 'male') {
		kcPerDiem = (66 + (6.23 * weight) + (12.7 * height) - (6.8 * age)) * intActivityLevel;
	} else {
		kcPerDiem = (655 + (4.35 * weight) + (4.7 * height) - (4.7 * age)) * intActivityLevel;
	}

	if (kcPerDiem == null) {
		return 0;
	}

	return kcPerDiem;
}
