import "dotenv/config.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
