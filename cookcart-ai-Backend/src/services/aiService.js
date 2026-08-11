import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Recipe from "../models/Recipe.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export class AIService {
  static async understandDishIntent(query) {
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, falling back to basic matching.");
      return null;
    }

    try {
      const recipes = await Recipe.find({}, "name slug");
      const recipeListText = recipes
        .map((r) => `${r.name} (${r.slug})`)
        .join(", ");

      const prompt = `You are a culinary assistant for a grocery delivery app.
A user searched for: "${query}".
We have the following curated recipes available in our database: [${recipeListText}].
Identify if the user's search closely matches the intent of any of these recipes (accounting for misspellings, aliases, or variations).
If it matches, reply ONLY with the exact recipe slug (e.g., paneer-butter-masala).
If it does not clearly match any of them, reply with "NONE".`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      if (responseText === "NONE" || responseText === "") {
        return null;
      }
      return responseText;
    } catch (error) {
      console.error("Error in understandDishIntent:", error);
      return null;
    }
  }
}
