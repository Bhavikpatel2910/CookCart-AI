import mongoose from "mongoose";
const { Schema } = mongoose;

const RecipeIngredientSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const RecipeSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    baseServings: { type: Number, required: true },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    dietType: { type: String },
    cuisine: { type: String },
    ingredients: [RecipeIngredientSchema],
    steps: [{ type: String }],
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Recipe", RecipeSchema);
