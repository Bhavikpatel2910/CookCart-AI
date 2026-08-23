import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Ingredient from "../models/Ingredient.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import Pantry from "../models/Pantry.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, "seed");

const readJSON = (filename) =>
  JSON.parse(fs.readFileSync(path.join(SEED_DIR, filename), "utf-8"));

// The dataset uses human-readable string ids (e.g. "ING_PANEER", "SKU0001",
// "PBM001") so it's portable and easy to read/edit. MongoDB generates its
// own ObjectIds on insert, so we remap dataset-id -> real ObjectId as we go
// and rewrite every reference (products.ingredientId, recipes.ingredients[].ingredientId)
// to point at the freshly created documents.
const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/cookcart";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    await Ingredient.deleteMany({});
    await Product.deleteMany({});
    await Recipe.deleteMany({});
    await Pantry.deleteMany({});
    console.log("Cleared existing data.");

    // ---------- Ingredients ----------
    const rawIngredients = readJSON("ingredients.json");
    const ingredientIdMap = new Map(); // dataset _id -> Mongo ObjectId

    for (const raw of rawIngredients) {
      const doc = await Ingredient.create({
        canonicalName: raw.canonicalName,
        aliases: raw.aliases || [],
        category: raw.category,
        defaultUnit: raw.defaultUnit,
        isPantryStaple: raw.isPantryStaple ?? false,
        active: raw.active ?? true,
      });
      ingredientIdMap.set(raw._id, doc._id);
    }
    console.log(`Seeded ${ingredientIdMap.size} ingredients.`);

    // ---------- Products ----------
    const rawProducts = readJSON("products.json");
    let productCount = 0;
    let skippedProducts = 0;

    for (const raw of rawProducts) {
      const ingredientObjectId = ingredientIdMap.get(raw.ingredientId);
      if (!ingredientObjectId) {
        console.warn(
          `Skipping product "${raw.name}" — unknown ingredientId "${raw.ingredientId}"`,
        );
        skippedProducts += 1;
        continue;
      }

      await Product.create({
        name: raw.name,
        brand: raw.brand,
        ingredientId: ingredientObjectId,
        packSize: raw.packSize,
        unit: raw.unit,
        price: raw.price,
        inventory: raw.inventory ?? 0,
        image: raw.image || undefined,
        category: raw.category,
        active: raw.active ?? true,
      });
      productCount += 1;
    }
    console.log(`Seeded ${productCount} products (${skippedProducts} skipped).`);

    // ---------- Recipes ----------
    const rawRecipes = readJSON("recipes.json");
    let recipeCount = 0;
    let skippedRecipeIngredients = 0;

    for (const raw of rawRecipes) {
      const ingredients = [];

      for (const ing of raw.ingredients || []) {
        const ingredientObjectId = ingredientIdMap.get(ing.ingredientId);
        if (!ingredientObjectId) {
          console.warn(
            `Skipping ingredient "${ing.ingredientId}" in recipe "${raw.name}" — not found`,
          );
          skippedRecipeIngredients += 1;
          continue;
        }
        const ingredientDoc = rawIngredients.find((i) => i._id === ing.ingredientId);

        ingredients.push({
          ingredientId: ingredientObjectId,
          name: ingredientDoc?.canonicalName || ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          required: ing.required ?? true,
          critical: ing.critical ?? true,
          scalingRule: ing.scalingRule || "linear",
        });
      }

      const steps = (raw.steps || []).map((s, idx) => ({
        step: s.step ?? idx + 1,
        title: s.title || "",
        description: s.description || "",
      }));

      await Recipe.create({
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        image: raw.image,
        imageSource: raw.imageSource,
        baseServings: raw.baseServings,
        prepTime: raw.prepTime,
        cookTime: raw.cookTime,
        difficulty: raw.difficulty,
        dietType: raw.dietType,
        cuisine: raw.cuisine,
        ingredients,
        steps,
        tags: raw.tags || [],
      });
      recipeCount += 1;
    }
    console.log(
      `Seeded ${recipeCount} recipes (${skippedRecipeIngredients} ingredient refs skipped).`,
    );

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
