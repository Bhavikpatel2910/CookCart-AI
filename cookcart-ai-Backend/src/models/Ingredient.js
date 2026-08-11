import mongoose from "mongoose";
const { Schema } = mongoose;

const IngredientSchema = new Schema(
  {
    canonicalName: { type: String, required: true, unique: true },
    aliases: [{ type: String }],
    category: { type: String, required: true },
    defaultUnit: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Ingredient", IngredientSchema);
