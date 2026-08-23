import mongoose from "mongoose";
const { Schema } = mongoose;

const IngredientSchema = new Schema(
  {
    canonicalName: { type: String, required: true, unique: true },
    aliases: [{ type: String }],
    category: { type: String, required: true },
    defaultUnit: { type: String, required: true },
    // Phase 2 Smart Pantry: flags common staples (salt, oil, turmeric...)
    // so the UI can pre-suggest them for a user's pantry checklist.
    isPantryStaple: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Ingredient", IngredientSchema);
