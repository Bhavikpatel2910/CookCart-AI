import mongoose from "mongoose";
import dotenv from "dotenv";
import Ingredient from "../models/Ingredient.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import Pantry from "../models/Pantry.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/cookcart";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    await Ingredient.deleteMany({});
    await Product.deleteMany({});
    await Recipe.deleteMany({});
    await Pantry.deleteMany({});
    console.log("Cleared existing data.");

    const paneer = await Ingredient.create({
      canonicalName: "Paneer",
      aliases: ["Indian Cottage Cheese", "Fresh Paneer"],
      category: "Dairy",
      defaultUnit: "g",
    });

    const tomato = await Ingredient.create({
      canonicalName: "Tomato",
      aliases: ["Fresh Tomato", "Tomatoes"],
      category: "Vegetables",
      defaultUnit: "g",
    });

    const butter = await Ingredient.create({
      canonicalName: "Butter",
      aliases: ["Amul Butter", "Salted Butter"],
      category: "Dairy",
      defaultUnit: "g",
    });

    const garamMasala = await Ingredient.create({
      canonicalName: "Garam Masala",
      aliases: ["Masala", "Mixed Spices"],
      category: "Spices",
      defaultUnit: "g",
    });

    await Product.create([
      {
        name: "Amul Fresh Paneer",
        brand: "Amul",
        ingredientId: paneer._id,
        packSize: 200,
        unit: "g",
        price: 90,
        inventory: 50,
        category: "Dairy",
      },
      {
        name: "Mother Dairy Paneer",
        brand: "Mother Dairy",
        ingredientId: paneer._id,
        packSize: 400,
        unit: "g",
        price: 170,
        inventory: 20,
        category: "Dairy",
      },
      {
        name: "Fresh Hybrid Tomato",
        brand: "Local",
        ingredientId: tomato._id,
        packSize: 500,
        unit: "g",
        price: 40,
        inventory: 100,
        category: "Vegetables",
      },
      {
        name: "Amul Salted Butter",
        brand: "Amul",
        ingredientId: butter._id,
        packSize: 100,
        unit: "g",
        price: 58,
        inventory: 200,
        category: "Dairy",
      },
      {
        name: "Amul Salted Butter Large",
        brand: "Amul",
        ingredientId: butter._id,
        packSize: 500,
        unit: "g",
        price: 285,
        inventory: 50,
        category: "Dairy",
      },
      {
        name: "Everest Garam Masala",
        brand: "Everest",
        ingredientId: garamMasala._id,
        packSize: 50,
        unit: "g",
        price: 45,
        inventory: 30,
        category: "Spices",
      },
    ]);

    await Recipe.create({
      name: "Paneer Butter Masala",
      slug: "paneer-butter-masala",
      description:
        "A rich & creamy curry made with paneer, spices, onions, tomatoes, cashews and butter.",
      image: "https://example.com/pbm.jpg",
      baseServings: 4,
      prepTime: 15,
      cookTime: 30,
      difficulty: "Easy",
      dietType: "Vegetarian",
      cuisine: "North Indian",
      ingredients: [
        {
          ingredientId: paneer._id,
          name: "Paneer",
          quantity: 400,
          unit: "g",
          required: true,
        },
        {
          ingredientId: tomato._id,
          name: "Tomatoes",
          quantity: 300,
          unit: "g",
          required: true,
        },
        {
          ingredientId: butter._id,
          name: "Butter",
          quantity: 75,
          unit: "g",
          required: true,
        },
        {
          ingredientId: garamMasala._id,
          name: "Garam Masala",
          quantity: 10,
          unit: "g",
          required: true,
        },
      ],
      steps: [
        "Heat butter in a pan.",
        "Add chopped tomatoes and cook until soft.",
        "Blend to a smooth puree.",
        "Cook puree with spices (Garam Masala).",
        "Add cubed paneer and simmer for 5 minutes.",
      ],
      tags: ["curry", "dinner", "popular"],
    });

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
