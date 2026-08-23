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
    // FR-03: whether this ingredient appears in the shopping list at all
    required: { type: Boolean, default: true },
    // FR-10: whether the recipe is "unavailable to cook" if this ingredient
    // can't be sourced (e.g. paneer for Paneer Butter Masala). Garnish-type
    // ingredients (e.g. kasuri methi) are required=false/critical=false and
    // never block feasibility.
    critical: { type: Boolean, default: true },
    // FR-04: per-ingredient scaling behaviour used by the deterministic
    // serving engine — 'linear' scales proportionally with servings,
    // 'moderate' applies the dampened non-linear curve (spices/oil/salt),
    // 'fixed' does not scale with servings at all (e.g. a garnish pinch).
    scalingRule: {
      type: String,
      enum: ["linear", "moderate", "fixed"],
      default: "linear",
    },
  },
  { _id: false },
);

const RecipeStepSchema = new Schema(
  {
    step: { type: Number, required: true },
    title: { type: String },
    description: { type: String, required: true },
  },
  { _id: false },
);

const RecipeSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    imageSource: { type: Schema.Types.Mixed },
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
    steps: [RecipeStepSchema],
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Recipe", RecipeSchema);
