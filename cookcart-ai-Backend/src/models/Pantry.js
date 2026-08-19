import mongoose from "mongoose";
const { Schema } = mongoose;

const PantryIngredientSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const PantrySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    ingredients: [PantryIngredientSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Pantry", PantrySchema);
